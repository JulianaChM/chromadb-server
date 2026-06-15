import { Document } from "@langchain/core/documents";
import { vectorStore } from "./vector-store";
import { db } from "../firebase";

async function loadIncidentsFromFirestore() {
  console.log("Cargando incidentes desde Firestore...");
  // Asumo que la colección se llama 'incidents'
  const incidentsSnapshot = await db.collection('incidents').get();
  
  if (incidentsSnapshot.empty) {
    console.log("No se encontraron incidentes en Firestore.");
    return [];
  }

  const incidents = incidentsSnapshot.docs.map(doc => {
    const data = doc.data();
    // Combinar campos relevantes en un único texto para el embedding
    const pageContent = `Tipo de incidente: ${data.type}. Ubicación: ${data.location}. Descripción: ${data.description}. Fecha: ${data.timestamp?.toDate()?.toLocaleString() ?? 'No especificada'}. Ambulancia asignada: ${data.assignedAmbulance ?? 'Ninguna'}. Hospital asignado: ${data.assignedHospital ?? 'Ninguno'}. Estado: ${data.status}.`;
    
    // Mantener los datos originales como metadatos para referencia
    const metadata = {
        id: doc.id,
        ...data
    };

    return new Document({ pageContent, metadata });
  });

  console.log(`Se cargaron ${incidents.length} incidentes de Firestore.`);
  return incidents;
}

// Variable para asegurar que la inicialización se ejecute solo una vez
let initialized = false;

export async function initializeVectorStore() {
  if (initialized) {
    return;
  }
  initialized = true;

  console.log("Verificando estado de la base de datos de vectores (ChromaDB)...");

  try {
    const collection = await vectorStore.getCollection();
    const count = await collection.count();

    if (count > 0) {
      console.log(`La colección 'incidentes' en ChromaDB ya tiene ${count} documentos. No se requiere acción.`);
      return;
    }

    console.log("La colección 'incidentes' está vacía. Poblando desde Firestore...");

    const incidentsAsDocuments = await loadIncidentsFromFirestore();

    if (incidentsAsDocuments.length > 0) {
      console.log("Creando embeddings y almacenando en ChromaDB...");
      await vectorStore.addDocuments(incidentsAsDocuments);
      console.log("Población de ChromaDB completada exitosamente.");
    } else {
      console.log("No hay incidentes en Firestore para agregar a ChromaDB.");
    }
  } catch (error: any) {
    console.error("Error durante la inicialización del Vector Store:", error.message);
    // Permitir reintento si la aplicación se reinicia
    initialized = false; 
  }
}
