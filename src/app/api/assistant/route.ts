import { queryIncidents } from "@/lib/ai/rag";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "La pregunta es requerida" }, { status: 400 });
    }

    const { answer, sourceDocuments } = await queryIncidents(question);

    return NextResponse.json({
      output: answer,
      sourceDocuments: sourceDocuments,
    });
  } catch (error: any) {
    // Log detallado en el servidor para nuestra referencia
    console.error("[API /api/assistant] Error Crítico:", error);

    // Crear una respuesta de error manual y robusta
    const errorPayload = {
      error: "Ocurrió un error en el servidor del asistente.",
      // Asegurarnos de que siempre haya un mensaje y un stack
      details: error.message || "No hay mensaje de error específico.",
      stack: error.stack || "No hay stack de error disponible.",
    };

    return new Response(JSON.stringify(errorPayload), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
