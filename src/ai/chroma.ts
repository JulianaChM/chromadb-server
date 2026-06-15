import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "text-embedding-004",
});

export const vectorStore = new Chroma(
  embeddings,
  {
    collectionName: "incidentes",
    url: process.env.CHROMA_URL,
  }
);