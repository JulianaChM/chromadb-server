import { Chroma } from "@langchain/community/vectorstores/chroma";
import { embeddings } from "./models";

if (!process.env.CHROMA_URL) {
    throw new Error("La variable de entorno CHROMA_URL no está definida.");
}
export const vectorStore = new Chroma(embeddings, {
    collectionName: "incidentes",
    url: process.env.CHROMA_URL,
});

export const retriever = vectorStore.asRetriever({
    k: 5,
    verbose: true,
});
