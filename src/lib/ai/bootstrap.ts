// src/lib/ai/bootstrap.ts
import { Document } from "@langchain/core/documents";
import { vectorStore } from "./vector-store";
import { db } from "../firebase";
import { ChromaClient } from "chromadb";

async function loadIncidentsFromFirestore() {
  console.log("Cargando incidentes desde Firestore...");
  const incidentsSnapshot = await db.collection('incidents').get();
  
  if (incidentsSnapshot.empty) {
    console.log("No se encontraron incidentes en Firestore.");
    return [];
  }

  const incidents = incidentsSnapshot.docs.map(doc => {
    const data = doc.data();
    const pageContent = `Tipo de incidente: ${data.type}. Ubicación: ${data.location}. Descripción: ${data.description}. Fecha: ${data.timestamp?.toDate()?.toLocaleString() ?? 'No especificada'}. Ambulancia asignada: ${data.assignedAmbulance ?? 'Ninguna'}. Hospital asignado: ${data.assignedHospital ?? 'Ninguno'}. Estado: ${data.status}.`;
    
    const metadata = {
        id: doc.id,
        ...data
    };

    return new Document({ pageContent, metadata });
  });

  console.log(`Se cargaron ${incidents.length} incidentes de Firestore.`);
  return incidents;
}

let initialized = false;

export async function initializeVectorStore() {
  if (initialized) {
    return;
  }
  initialized = true;

  console.log("🔍 Verificando estado de la base de datos de vectores (ChromaDB)...");

  try {
    // Acceder al cliente de ChromaDB directamente
    const chromaClient = new ChromaClient({
      path: process.env.CHROMA_URL?.replace(/\/$/, "")
    });

    const collection = await chromaClient.getOrCreateCollection({
      name: "incidentes"
    });
    
    const count = await collection.count();

    console.log(`📊 Total de documentos en ChromaDB: ${count}`);

    if (count > 0) {
      console.log("✅ La colección 'incidentes' ya tiene documentos.\n");
      
      // IMPRIME EL CONTENIDO DE CHROMADB
      try {
        const allData = await collection.get();
        console.log("📋 === CONTENIDO DE CHROMADB ===");
        console.log(JSON.stringify(allData, null, 2));
        console.log("=== FIN DEL CONTENIDO ===\n");
      } catch (err) {
        console.log("⚠️ No se pudo obtener el contenido detallado de ChromaDB:", err);
      }
      
      return;
    }

    console.log("⚠️ La colección 'incidentes' está vacía. Poblando desde Firestore...");

    const incidentsAsDocuments = await loadIncidentsFromFirestore();

    if (incidentsAsDocuments.length > 0) {
      console.log("🔄 Creando embeddings y almacenando en ChromaDB...");
      await vectorStore.addDocuments(incidentsAsDocuments);
      console.log("✨ Población de ChromaDB completada exitosamente.");
    } else {
      console.log("❌ No hay incidentes en Firestore para agregar a ChromaDB.");
    }
  } catch (error: any) {
    console.error("❌ Error durante la inicialización del Vector Store:", error.message);
    initialized = false; 
  }
}