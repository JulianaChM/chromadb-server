
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
    
    const tableNames = await connection.tableNames();
    console.log("ℹ️ Tablas encontradas en LanceDB:", tableNames);

    let table;
    if (tableNames.includes('incidentes_vectors')) {
      table = await connection.openTable('incidentes_vectors');
      console.log("✅ Tabla 'incidentes_vectors' abierta.");
    } else {
      console.log("🆕 Creando tabla 'incidentes_vectors'...");
      table = await connection.createTable('incidentes_vectors', [
        { 
          vector: Array(768).fill(0), 
          text: 'initialization_node', 
          id: '0', 
          metadata: JSON.stringify({ type: 'init' }) 
        }
      ]);
      console.log("✅ Tabla 'incidentes_vectors' creada.");
    }

    const vectorStore = new LanceDB(embeddings, { table });
    
    console.log("ℹ️ Consultando incidentes en Firestore...");
    // Intentamos obtener los incidentes. 
    // Nota: 'db' es la instancia de Firebase Admin
    const incidentsSnapshot = await db.collection('incidentes').get();

    if (incidentsSnapshot.empty) {
      console.log("🟡 No se encontraron incidentes en Firestore para indexar.");
      return;
    }

    console.log(`📊 Encontrados ${incidentsSnapshot.size} incidentes. Generando embeddings...`);

    const documents = incidentsSnapshot.docs.map((doc) => {
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
          docId: doc.id,
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

    console.log(`✅ Sincronización completada: ${documents.length} incidentes vectorizados.`);

  } catch (error) {
    console.error("❌ Error durante el proceso de bootstrap de embeddings:", error);
  }
}
