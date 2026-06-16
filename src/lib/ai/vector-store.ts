
import { LanceDB } from "@langchain/community/vectorstores/lancedb";
import { embeddings } from "./models";
import { connect } from "@lancedb/lancedb";

const dbPath = process.env.LANCEDB_PATH || "lancedb.db";

let vectorStore: LanceDB;

async function initializeVectorStore() {
    const connection = await connect(dbPath);
    
    let table;
    try {
        const tableNames = await connection.tableNames();
        if (tableNames.includes("incidentes_vectors")) {
            table = await connection.openTable("incidentes_vectors");
        } else {
            table = await connection.createTable("incidentes_vectors", [
                { vector: Array(768).fill(0), text: "init", id: "0", metadata: {} }
            ]);
        }
    } catch (e) {
        console.error("Error al abrir/crear tabla en LanceDB:", e);
        throw e;
    }
    
    vectorStore = new LanceDB(embeddings, { table });
}

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
