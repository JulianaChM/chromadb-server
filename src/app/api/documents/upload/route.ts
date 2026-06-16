import { NextRequest, NextResponse } from 'next/server';
import { embeddings } from '@/lib/ai/models';
import { addDocumentsToVectorStore } from '@/lib/ai/vector-store';
import { parseDocuments } from '@/lib/documents/parser';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files.length) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    console.log(`📥 Iniciando carga de ${files.length} archivo(s)`);

    // Procesar documentos
    const documents = await Promise.all(
      files.map(async (file) => {
        console.log(`📄 Parseando: ${file.name}`);
        const content = await parseDocuments(file);
        return content;
      })
    );

    console.log('🔄 Generando embeddings...');

    // Crear chunks SIMPLES (solo id, text, vector - sin metadatos)
    const documentChunks = await Promise.all(
      documents.flatMap((chunks) =>
        chunks.map(async (chunk) => {
          const vector = await embeddings.embedQuery(chunk.text);
          return {
            id: `doc_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            text: chunk.text,
            vector,
          };
        })
      )
    );

    console.log(`✅ Guardando ${documentChunks.length} segmentos en LanceDB...`);
    await addDocumentsToVectorStore(documentChunks);

    console.log(`✅ Carga completada exitosamente`);

    return NextResponse.json({
      success: true,
      processed: documentChunks.length,
      message: `Se indexaron ${documentChunks.length} segmentos de ${files.length} documento(s)`,
    });
  } catch (error: any) {
    console.error('[API /api/documents/upload] Error:', error);
    return NextResponse.json(
      {
        error: 'Error processing documents',
        details: error.message,
      },
      { status: 500 }
    );
  }
}