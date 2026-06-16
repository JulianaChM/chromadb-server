import { diagnoseRetrieval } from "@/lib/ai/diagnose-retrieval";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await diagnoseRetrieval();
        
        return NextResponse.json({
            success: true,
            message: "Diagnóstico completado. Revisa los logs del servidor."
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}