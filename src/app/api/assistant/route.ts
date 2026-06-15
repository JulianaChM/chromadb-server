import { llm } from "@/lib/ai/models";
import { NextRequest, NextResponse } from "next/server";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { CODEBLUE_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json(
        { error: "La pregunta es requerida" },
        { status: 400 }
      );
    }

    // ✅ Crear mensajes con contexto del sistema
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
    console.error("[API /api/assitant-simple] Error:", error);
    return NextResponse.json(
      {
        error: "Error en el servidor",
        details: error.message,
      },
      { status: 500 }
    );
  }
}