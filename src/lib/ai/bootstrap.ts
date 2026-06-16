
import { connect } from '@lancedb/lancedb';
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { LanceDB } from "@langchain/community/vectorstores/lancedb";
import { db } from '@/lib/firebase';

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "embedding-001",
});

export async function bootstrapIncidentEmbeddings() {
  console.log("🚀 Iniciando proceso de bootstrap para embeddings de incidentes...");

  try {
    const dbPath = process.env.LANCEDB_PATH || "lancedb.db";
    const connection = await connect(dbPath);
    
    // Abrir o crear la tabla de forma segura
    let table;
    const tableNames = await connection.tableNames();
    if (tableNames.includes('incidentes_vectors')) {
      table = await connection.openTable('incidentes_vectors');
    } else {
      table = await connection.createTable('incidentes_vectors', [
        { vector: Array(768).fill(0), text: 'init', id: '0', metadata: {} }
      ]);
    }

    const vectorStore = new LanceDB(embeddings, { table });
    
    console.log("ℹ️ Verificando incidentes en Firestore...");
    // Usamos any para evitar errores de tipado entre SDKs de Firebase en el entorno de build
    const incidentsSnapshot = await (db as any).collection('incidentes').get();

    if (incidentsSnapshot.empty) {
      console.log("🟡 No se encontraron incidentes en Firestore.");
      return;
    }

    const documents = incidentsSnapshot.docs.map((doc: any) => {
      const data = doc.data();
      const representativeText = `
        Tipo: ${data.tipo_emergencia || data.tipo || 'N/A'},
        Prioridad: ${data.prioridad || 'N/A'},
        Descripción: ${data.descripcion || 'Sin descripción'},
        Estado: ${data.estado || 'N/A'},
        Paciente: ${data.nombre_paciente || 'Anónimo'}
      `;
      
      return {
        pageContent: representativeText,
        metadata: {
          docId: doc.id, // Usamos docId para evitar conflictos con la propiedad id de LanceDB
          tipo: data.tipo_emergencia || data.tipo || '',
          gravedad: data.prioridad || '',
          fecha: data.createdAt && typeof data.createdAt.toDate === 'function' 
            ? data.createdAt.toDate().toISOString() 
            : (data.createdAt || new Date().toISOString()),
        }
      };
    });

    // Agregamos los documentos al almacén de vectores
    await vectorStore.addDocuments(documents);

    console.log(`✅ Se han procesado ${documents.length} incidentes hacia el almacén de vectores.`);

  } catch (error) {
    console.error("❌ Error durante el proceso de bootstrap de embeddings de incidentes:", error);
  }
}
