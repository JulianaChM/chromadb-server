import { LanceDB } from "@langchain/community/vectorstores/lancedb";
import { embeddings } from "./models";
import { connect, Connection } from "@lancedb/lancedb";

const dbPath = process.env.LANCEDB_PATH || "lancedb.db";

let vectorStore: LanceDB;

async function initializeVectorStore() {
    const db: Connection = await connect(dbPath);
    
    let table;
    try {
        table = await db.openTable("incidentes_vectors");
    } catch (e) {
        table = await db.createTable("incidentes_vectors", [
            { vector: Array(768).fill(0), text: "init", id: "0" }
        ]);
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
