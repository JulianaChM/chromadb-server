<<<<<<< HEAD
// src/lib/ai/vector-store.ts
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { ChromaClient } from "chromadb";
=======

import { LanceDB } from "@langchain/community/vectorstores/lancedb";
>>>>>>> a9a13206b63ce6721a4d146690aab2ed1067983e
import { embeddings } from "./models";
import { connect } from "@lancedb/lancedb";

const dbPath = process.env.LANCEDB_PATH || "lancedb.db";

let vectorStore: LanceDB;

async function initializeVectorStore() {
    try {
        const connection = await connect(dbPath);
        const tableNames = await connection.tableNames();
        
        let table;
        if (tableNames.includes("incidentes_vectors")) {
            table = await connection.openTable("incidentes_vectors");
        } else {
            table = await connection.createTable("incidentes_vectors", [
                { vector: Array(768).fill(0), text: "init", id: "0", metadata: {} }
            ]);
        }
        
        vectorStore = new LanceDB(embeddings, { table });
    } catch (e) {
        console.error("Error al inicializar LanceDB:", e);
        throw e;
    }
}
<<<<<<< HEAD

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
=======

export async function getVectorStore(): Promise<LanceDB> {
    if (!vectorStore) {
        await initializeVectorStore();
    }
    return vectorStore;
}

export async function getRetriever() {
    const store = await getVectorStore();
    return store.asRetriever({
        k: 5,
    });
}
>>>>>>> a9a13206b63ce6721a4d146690aab2ed1067983e
