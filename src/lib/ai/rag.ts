import { searchKnowledgeWithFilters, SearchFilters, searchDocuments } from "./vector-store";
import { llm } from "./models";
import { CODEBLUE_SYSTEM_PROMPT } from "./system-prompt";

export interface RAGResponse {
  answer: string;
  sourceDocuments: Array<{
    id: string;
    tipo: string;
    gravedad: string;
    estado: string;
    nombre_paciente: string;
    edad_aproximada: number;
    descripcion: string;
    direccion: string;
    createdAt: string;
    relevanceScore: string;
  }>;
}

export async function queryIncidents(
  question: string,
  filters?: SearchFilters,
  similarityThreshold: number = 0.7
): Promise<RAGResponse> {
  try {
    console.log("🚀 Iniciando flujo RAG...");

    // PASO 1: Búsqueda con filtros
    console.log("📊 PASO 1: Búsqueda semántica con filtros en LanceDB");
    const relevantDocuments = await searchKnowledgeWithFilters(
      question,
      filters,
      similarityThreshold
    );

    // PASO 2: Construir contexto
    console.log("📝 PASO 2: Construcción de contexto");
    const contextText = relevantDocuments
      .map(
        (doc, idx) => `
[Incidente ${idx + 1}] (Similitud: ${doc.relevanceScore})
─────────────────────────────────────
${doc.content}
Paciente: ${doc.metadata.nombre_paciente} (${doc.metadata.edad_aproximada} años)
Dirección: ${doc.metadata.direccion}
Estado: ${doc.metadata.estado} | Prioridad: ${doc.metadata.gravedad}
Fecha: ${doc.metadata.createdAt}
`
      )
      .join("\n");

    // PASO 3: Construir prompt enriquecido
    const enrichedPrompt = `${CODEBLUE_SYSTEM_PROMPT}

${relevantDocuments.length > 0
        ? `CONTEXTO RELEVANTE DE INCIDENTES PREVIOS:
═════════════════════════════════════════
${contextText}
═════════════════════════════════════════

Usa la información anterior para informar tu respuesta.`
        : "No hay incidentes previos relevantes en la base de datos."
      }

PREGUNTA DEL USUARIO:
${question}`;

    // PASO 4: Llamar a Gemini
    console.log("🤖 PASO 3: Generando respuesta con Gemini");
    const response = await llm.invoke(enrichedPrompt);

    console.log("✅ Flujo RAG completado");

    return {
      answer: response.content as string,
      sourceDocuments: relevantDocuments.map((doc) => ({
        id: doc.id,
        tipo: doc.metadata.tipo,
        gravedad: doc.metadata.gravedad,
        estado: doc.metadata.estado,
        nombre_paciente: doc.metadata.nombre_paciente,
        edad_aproximada: doc.metadata.edad_aproximada,
        descripcion: doc.metadata.descripcion,
        direccion: doc.metadata.direccion,
        createdAt: doc.metadata.createdAt,
        relevanceScore: doc.relevanceScore,
      })),
    };
  } catch (error) {
    console.error("❌ Error en queryIncidents:", error);
    throw error;
  }
}

/**
 * Búsqueda combinada en incidentes Y documentos
 */
export async function queryIncidentsAndDocuments(
  question: string,
  filters?: SearchFilters,
  similarityThreshold: number = 0.7
): Promise<RAGResponse> {
  try {
    console.log("🚀 Iniciando búsqueda combinada (incidentes + documentos)...");

    // Búsqueda paralela en ambas tablas
    const [relevantIncidents, relevantDocuments] = await Promise.all([
      searchKnowledgeWithFilters(question, filters, similarityThreshold),
      searchDocuments(question, similarityThreshold),
    ]);

    console.log(`📊 Incidentes: ${relevantIncidents.length}, Documentos: ${relevantDocuments.length}`);

    // Combinar y ordenar por similitud
    const allSources = [
      ...relevantIncidents.map(d => ({ ...d, sourceType: 'incident' })),
      ...relevantDocuments.map(d => ({ ...d, sourceType: 'document' }))
    ]
      .sort((a, b) => parseFloat(b.relevanceScore) - parseFloat(a.relevanceScore))
      .slice(0, 15); // Top 15 combinados

    // Construir contexto
    const contextText = allSources
      .map(
        (doc, idx) => `
[${doc.sourceType === 'incident' ? 'Incidente' : 'Documento'} ${idx + 1}] (Similitud: ${doc.relevanceScore})
─────────────────────────────────────
${doc.content}
${doc.sourceType === 'incident' ? `
Paciente: ${doc.metadata.nombre_paciente} (${doc.metadata.edad_aproximada} años)
Dirección: ${doc.metadata.direccion}
Estado: ${doc.metadata.estado} | Prioridad: ${doc.metadata.gravedad}
Fecha: ${doc.metadata.createdAt}
` : ''}
`
      )
      .join("\n");

    // Construir prompt
    const enrichedPrompt = `${CODEBLUE_SYSTEM_PROMPT}

${allSources.length > 0
        ? `CONTEXTO RELEVANTE (Incidentes y Protocolos):
═════════════════════════════════════════
${contextText}
═════════════════════════════════════════

Usa la información anterior para informar tu respuesta. Los documentos te ayudan con protocolos y mejores prácticas.`
        : "No hay incidentes previos ni protocolos relevantes en la base de datos."
      }

PREGUNTA DEL USUARIO:
${question}`;

    // Llamar a Gemini
    console.log("🤖 Generando respuesta con Gemini...");
    const response = await llm.invoke(enrichedPrompt);

    console.log("✅ Búsqueda combinada completada");

    return {
      answer: response.content as string,
      sourceDocuments: allSources.map((doc) => ({
        id: doc.id,
        tipo: doc.metadata?.tipo || doc.sourceType,
        gravedad: doc.metadata?.gravedad || "N/A",
        estado: doc.metadata?.estado || "N/A",
        nombre_paciente: doc.metadata?.nombre_paciente || "Protocolo/Documento",
        edad_aproximada: doc.metadata?.edad_aproximada || 0,
        descripcion: doc.content,
        direccion: doc.metadata?.direccion || "N/A",
        createdAt: doc.metadata?.createdAt || new Date().toISOString(),
        relevanceScore: doc.relevanceScore,
      })),
    };
  } catch (error) {
    console.error("❌ Error en queryIncidentsAndDocuments:", error);
    throw error;
  }
}