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
    console.error("Error en el endpoint del asistente:", error.message);
    return NextResponse.json({ error: "Ocurrió un error al procesar la solicitud" }, { status: 500 });
  }
}
