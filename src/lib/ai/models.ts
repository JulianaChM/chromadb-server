
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

// Usamos modelos estándar conocidos para evitar errores durante el arranque del servidor.
export const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  apiKey: process.env.GEMINI_API_KEY || "temporary-key-to-prevent-startup-crash",
});

export const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY || "temporary-key-to-prevent-startup-crash",
    model: "gemini-embedding-001",
});

export function checkApiKey() {
    if (!process.env.GEMINI_API_KEY) {
        console.warn("⚠️ La variable de entorno GEMINI_API_KEY no está definida. Las funciones de IA pueden fallar.");
        return false;
    }
    return true;
}
