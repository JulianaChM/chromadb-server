import { syncIncidentsToVectorStore } from "@/lib/ai/vector-store";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const result = await syncIncidentsToVectorStore();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API /api/vector-store/sync] Error:", error);
    return NextResponse.json(
      {
        success: false,
        count: 0,
        message: `Error: ${error.message}`,
      },
      { status: 500 }
    );
  }
}