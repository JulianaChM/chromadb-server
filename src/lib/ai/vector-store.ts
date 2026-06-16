import { LanceDB } from "@langchain/community/vectorstores/lancedb";
import { embeddings } from "./models";
import { connect, Connection, Table } from "@lancedb/lancedb";

// Define la ruta para la base de datos LanceDB. Usaremos un directorio.
const dbPath = process.env.LANCEDB_PATH || "lancedb.db";

let vectorStore: LanceDB;

// La inicialización ahora es asíncrona
async function initializeVectorStore() {
    const db: Connection = await connect(dbPath);
    // Intenta abrir la tabla, si no existe, la crea con un esquema inicial.
    const table = await db.openTable("incidentes").catch(() => 
        db.createTable("incidentes", [{ vector: Array(1536).fill(0), text: "init" }])
    );
    
    vectorStore = new LanceDB(embeddings, { table });
}

// Función para obtener la instancia del vector store. Llama a la inicialización si es necesario.
export async function getVectorStore(): Promise<LanceDB> {
    if (!vectorStore) {
        await initializeVectorStore();
    }
    return vectorStore;
}

// Función para obtener el retriever. También es asíncrona ahora.
export async function getRetriever() {
    const store = await getVectorStore();
    return store.asRetriever({
        k: 5,
        verbose: true,
    });
}
