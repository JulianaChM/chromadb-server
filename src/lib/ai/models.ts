
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

// Usamos modelos estándar conocidos para evitar errores durante el arranque del servidor.
// Si la API KEY no está configurada, el servidor no colapsará al importar el módulo.
const API_KEY = process.env.GEMINI_API_KEY || "AIzaSy_dummy_key_to_prevent_startup_crash";

export const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  apiKey: API_KEY,
});

export const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: API_KEY,
    model: "text-embedding-004",
});

export function checkApiKey() {
    if (!process.env.GEMINI_API_KEY) {
        console.warn("⚠️ La variable de entorno GEMINI_API_KEY no está definida. Las funciones de IA pueden fallar.");
        return false;
    }
    return true;
}
