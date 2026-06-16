'use server';

import { embeddings } from '@/lib/ai/models';
import { addIncidentToVectorStore } from '@/lib/ai/vector-store';

export async function POST(request: Request) {
    try {
        const { incidente_id, incidente, mensaje } = await request.json();

        // Validar datos requeridos
        if (!incidente_id || !incidente) {
            return Response.json(
                { success: false, error: 'Faltan datos requeridos (incidente_id, incidente)' },
                { status: 400 }
            );
        }

        // Construir el texto para vectorizar (igual que en vector-store.ts)
        const text = `
TIPO: ${incidente.tipo || incidente.tipo_emergencia || "desconocido"}
URGENCIA: ${incidente.prioridad || "DESCONOCIDO"}
PACIENTE: ${incidente.nombre_paciente || ""}, edad ${incidente.edad_aproximada || "desconocida"}
SÍNTOMAS Y DESCRIPCIÓN: ${incidente.descripcion || ""}
DIRECCIÓN: ${incidente.direccion || ""}
UBICACIÓN: ${incidente.lat || 0}, ${incidente.lng || 0}
ESTADO ACTUAL: ${incidente.estado || "PENDIENTE"}
    `.trim();

        console.log('🔄 Generando embedding para incidente:', incidente_id);

        // Generar embedding con Gemini
        const vector = await embeddings.embedQuery(text);

        // Crear documento para LanceDB
        const document = {
            id: incidente_id,
            text: text,
            vector: vector,
            tipo: incidente.tipo || incidente.tipo_emergencia || "desconocido",
            gravedad: incidente.prioridad || "DESCONOCIDO",
            estado: incidente.estado || "PENDIENTE",
            nombre_paciente: incidente.nombre_paciente || "",
            edad_aproximada: incidente.edad_aproximada || 0,
            descripcion: incidente.descripcion || "",
            direccion: incidente.direccion || "",
            lat: incidente.lat || 0,
            lng: incidente.lng || 0,
            timestamp: Date.now(),
        };

        // Insertar en LanceDB
        await addIncidentToVectorStore(document);

        console.log('✅ Incidente vectorizado e indexado correctamente');

        return Response.json({
            success: true,
            message: 'Incidente vectorizado e indexado correctamente',
            incidente_id,
            mensaje,
        });
    } catch (error) {
        console.error('❌ Error vectorizando incidente:', error);
        return Response.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}
