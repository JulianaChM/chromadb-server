// src/lib/ai/bootstrap.ts
import { connect } from '@lancedb/lancedb';
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { LanceDB } from "@langchain/community/vectorstores/lancedb";
import { db } from '@/lib/firebase';

interface IncidentData {
  ambulancia_id?: string;
  ambulancia_placa?: string;
  creado_en?: { toDate: () => Date };
  descripcion?: string;
  edad_aproximada?: number;
  estado?: string;
  finalizado_at?: string;
  hospital_id?: string;
  lat?: number;
  lng?: number;
  nombre_paciente?: string;
  prioridad?: string;
  tipo?: string;
}

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "embedding-001",
});

async function getVectorStore() {
  const connection = await connect('lancedb.db');
  // Creamos o abrimos la tabla directamente
  const table = await connection.createTable(
    'incidentes_vectors', 
    [{ vector: Array(768).fill(0), text: 'string', id: 'string' }], 
    { writeMode: 'overwrite' }
  );
  return new LanceDB(embeddings, { table });
}

export async function bootstrapIncidentEmbeddings() {
  console.log("🚀 Iniciando proceso de bootstrap para embeddings de incidentes...");

  try {
    const vectorStore = await getVectorStore();
    // Accedemos a la cuenta de filas de forma segura a través de los métodos públicos si estuvieran disponibles, 
    // o simplemente intentamos poblar si es necesario.
    
    console.log("ℹ️ Verificando incidentes en Firestore...");

    const incidentsSnapshot = await db.collection('incidentes').get();

    if (incidentsSnapshot.empty) {
      console.log("🟡 No se encontraron incidentes en Firestore.");
      return;
    }

    const documents = incidentsSnapshot.docs.map(doc => {
      const data = doc.data() as IncidentData;
      const representativeText = `
        Tipo: ${data.tipo || 'N/A'},
        Prioridad: ${data.prioridad || 'N/A'},
        Descripción: ${data.descripcion || 'Sin descripción'},
        Estado: ${data.estado || 'N/A'},
        Paciente: ${data.nombre_paciente || 'Anónimo'},
        Edad: ${data.edad_aproximada || 'N/A'}
      `;
      
      return {
        pageContent: representativeText,
        metadata: {
          id: doc.id,
          tipo: data.tipo || '',
          gravedad: data.prioridad || '',
          hospitalDestino: data.hospital_id || '',
          fecha: data.creado_en ? data.creado_en.toDate().toISOString() : new Date().toISOString(),
        }
      };
    });

    await vectorStore.addDocuments(documents);

    console.log(`✅ Se han procesado ${documents.length} incidentes hacia el almacén de vectores.`);

  } catch (error) {
    console.error("❌ Error durante el proceso de bootstrap de embeddings de incidentes:", error);
  }
}
