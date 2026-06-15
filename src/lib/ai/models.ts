import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

if (!process.env.GEMINI_API_KEY) {
    throw new Error("La variable de entorno GEMINI_API_KEY no está definida.");
}

export const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-pro",
  apiKey: process.env.GEMINI_API_KEY,
});

export const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: "text-embedding-004",
});
