// src/app/api/assistant/route.ts
import { llm } from "@/lib/ai/models";
import { NextRequest, NextResponse } from "next/server";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { CODEBLUE_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { ChromaClient } from "chromadb";

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json(
        { error: "La pregunta es requerida" },
        { status: 400 }
      );
    }

    // 🧪 PRUEBA: Si el usuario dice "hola", mostrar contenido de ChromaDB
    if (question.toLowerCase().includes("hola")) {
      console.log("🔍 Usuario dice 'hola' - Obteniendo contenido de ChromaDB...");
      
      try {
        const chromaClient = new ChromaClient({
          path: process.env.CHROMA_URL?.replace(/\/$/, ""),
          headers: {
            "Content-Type": "application/json"
          }
        });

        const collection = await chromaClient.getOrCreateCollection({
          name: "incidentes"
        });

        const count = await collection.count();
        console.log(`📊 Total de documentos en ChromaDB: ${count}`);

        if (count > 0) {
          const allData = await collection.get();
          console.log("📋 === CONTENIDO DE CHROMADB ===");
          console.log(JSON.stringify(allData, null, 2));
          console.log("=== FIN DEL CONTENIDO ===\n");

          return NextResponse.json({
            output: `¡Hola! La base de datos tiene ${count} documentos. Aquí está el contenido completo:`,
            chromaContent: allData,
            isHelloTest: true
          });
        } else {
          return NextResponse.json({
            output: "¡Hola! La base de datos de ChromaDB está vacía.",
            chromaContent: null,
            isHelloTest: true
          });
        }
      } catch (chromaError: any) {
        console.error("❌ Error al acceder a ChromaDB:", chromaError.message);
        return NextResponse.json({
          output: "¡Hola! Pero no pude acceder a ChromaDB para mostrar el contenido.",
          error: chromaError.message,
          isHelloTest: true
        });
      }
    }

    // ✅ Flujo normal: Crear mensajes con contexto del sistema
    const messages = [
      new SystemMessage(CODEBLUE_SYSTEM_PROMPT),
      new HumanMessage(question),
    ];

    const response = await llm.invoke(messages);

    console.log("✅ Respuesta de Gemini:", response.content);

    return NextResponse.json({
      output: response.content,
      sourceDocuments: [],
    });
  } catch (error: any) {
    console.error("[API /api/assistant] Error:", error);
    return NextResponse.json(
      {
        error: "Error en el servidor",
        details: error.message,
      },
      { status: 500 }
    );
  }
}