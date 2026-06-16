// src/lib/ai/bootstrap.ts
import { connect } from 'lancedb';
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { LanceDB } from "@langchain/community/vectorstores/lancedb";
import { db } from '../../firebase'; // Assuming firebase is initialized here

interface Incident {
  id: string;
  ambulancia_id: string;
  ambulancia_placa: string;
  creado_en: { toDate: () => Date };
  descripcion: string;
  edad_aproximada: number;
  estado: string;
  finalizado_at: string;
  hospital_id: string;
  lat: number;
  lng: number;
  nombre_paciente: string;
  prioridad: string;
  tipo: string;
}

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "embedding-001",
});

async function getVectorStore() {
  const db = await connect('lancedb');
  // Try to create the table if it doesn't exist.
  // This is more robust than just opening.
  const table = await db.createTable('incidentes_vectors', [{ vector: [], text: 'string', id: 'string' }], { writeMode: 'overwrite' });
  return new LanceDB(embeddings, { table });
}

export async function bootstrapIncidentEmbeddings() {
  console.log("🚀 Iniciando proceso de bootstrap para embeddings de incidentes...");

  try {
    const vectorStore = await getVectorStore();
    const table = vectorStore.table;
    const table_size = await table.countRows();

    if (table_size > 0) {
      console.log("✅ La tabla de vectores de incidentes ya contiene datos. No se requiere acción.");
      return;
    }

    console.log("ℹ️ La tabla de vectores de incidentes está vacía. Poblando desde Firestore...");

    const incidentsSnapshot = await db.collection('incidentes').get();

    if (incidentsSnapshot.empty) {
      console.log("🟡 No se encontraron incidentes en Firestore.");
      return;
    }

    const incidents: any[] = [];
    incidentsSnapshot.forEach(doc => {
      const data = doc.data() as Incident;
      incidents.push({ id: doc.id, ...data });
    });

    const documents = incidents.map(incident => {
      const representativeText = `
        Tipo: ${incident.tipo},
        Prioridad: ${incident.prioridad},
        Descripción: ${incident.descripcion},
        Estado: ${incident.estado},
        Paciente: ${incident.nombre_paciente},
        Edad: ${incident.edad_aproximada}
      `;
      return {
        pageContent: representativeText,
        metadata: {
          id: incident.id,
          tipo: incident.tipo,
          gravedad: incident.prioridad, // Assuming prioridad is gravity
          hospitalDestino: incident.hospital_id,
          fecha: incident.creado_en.toDate().toISOString(),
        }
      };
    });

    await vectorStore.addDocuments(documents);

    console.log(`✅ Se han insertado ${documents.length} incidentes en LanceDB.`);

  } catch (error) {
    console.error("❌ Error durante el proceso de bootstrap de embeddings de incidentes:", error);
  }
}
