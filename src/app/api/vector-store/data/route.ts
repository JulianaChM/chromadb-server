import { getVectorStore } from "@/lib/ai/vector-store";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const vectorStore = await getVectorStore();
    
    // Obtener la tabla de LanceDB
    const table = (vectorStore as any).table;
    
    if (!table) {
      return NextResponse.json(
        { error: "Vector store no inicializado" },
        { status: 500 }
      );
    }

    // ✅ Obtener todos los registros
    const data = await table.query().limit(100).toArray();

    return NextResponse.json({
      total: data.length,
      documents: data.map((doc: any) => ({
        id: doc.id,
        text: doc.text,
        tipo: doc.tipo,
        gravedad: doc.gravedad,
        hospitalDestino: doc.hospitalDestino,
        fecha: doc.fecha,
      })),
      message: `Se encontraron ${data.length} documentos en LanceDB`
    });
  } catch (error: any) {
    console.error("[API /api/vector-store/data] Error:", error);
    return NextResponse.json(
      {
        error: "Error al obtener datos del vector store",
        details: error.message,
      },
      { status: 500 }
    );
  }
}