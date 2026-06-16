
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

// Verificamos la clave de API solo cuando se intenta usar el modelo,
// para evitar que el servidor falle al arrancar durante el build si no está definida.
export const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
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
