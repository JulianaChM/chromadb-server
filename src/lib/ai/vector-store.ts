// src/lib/ai/vector-store.ts
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { ChromaClient } from "chromadb";
import { embeddings } from "./models";

if (!process.env.CHROMA_URL) {
    throw new Error("La variable de entorno CHROMA_URL no está definida.");
}

// 1. Inicializamos el cliente oficial de ChromaDB apuntando a Render
// Con cabeceras adicionales para compatibilidad con herramientas web
const chromaClient = new ChromaClient({
    path: process.env.CHROMA_URL.replace(/\/$/, ""), // Limpia barras diagonales finales
    headers: {
        "Content-Type": "application/json"
    }
});

// 2. Exportamos usando 'index' pero casteado 'as any' para evitar que LangChain
// ignore el cliente por incompatibilidad de versiones en las interfaces de TypeScript.
export const vectorStore = new Chroma(embeddings, {
    collectionName: "incidentes",
    index: chromaClient as any, // ⚠️ Fuerza a LangChain a usar esta instancia exacta
});

export const retriever = vectorStore.asRetriever({
    k: 5,
    verbose: true,
});

export async function initializeVectorStore() {
    try {
        console.log("✅ Vector Store inicializado (ChromaDB)");
    } catch (error) {
        console.error("❌ Error inicializando Vector Store:", error);
        throw error;
    }
}