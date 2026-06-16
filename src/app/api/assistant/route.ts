import { queryIncidents } from "@/lib/ai/rag";
import { SearchFilters } from "@/lib/ai/vector-store";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { question, filters, similarityThreshold } = await req.json();

    if (!question) {
      return NextResponse.json(
        { error: "La pregunta es requerida" },
        { status: 400 }
      );
    }

    console.log(`\n📨 Nueva pregunta: "${question}"`);
    if (filters) console.log("🔍 Filtros aplicados:", filters);

    // Ejecutar flujo RAG con filtros
    const result = await queryIncidents(
      question,
      filters as SearchFilters,
      similarityThreshold || 0.2
    );

    console.log(
      `✅ Respuesta generada. Documentos usados: ${result.sourceDocuments.length}`
    );

    return NextResponse.json(
      {
        success: true,
        output: result.answer,
        sourceDocuments: result.sourceDocuments,
        documentsCount: result.sourceDocuments.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[API /api/assistant] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error en el servidor",
        details: error.message,
      },
      { status: 500 }
    );
  }
}