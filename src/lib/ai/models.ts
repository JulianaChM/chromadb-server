import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// ✅ VOYAGE AI (ACTIVO)
import { VoyageEmbeddings } from "@langchain/community/embeddings/voyage";

// 📝 GEMINI (COMENTADO)
// import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY;
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

// ✅ VOYAGE: Embeddings con Voyage AI
export const embeddings = new VoyageEmbeddings({
    apiKey: VOYAGE_API_KEY,
    model: "voyage-3",
});

// 📝 GEMINI (Comentado - descomentar si necesitas volver):
// export const llm = new ChatGoogleGenerativeAI({
//   model: "gemini-2.5-flash",
//   apiKey: GEMINI_API_KEY,
// });

// 📝 GEMINI Embeddings (Comentado):
// export const embeddings = new GoogleGenerativeAIEmbeddings({
//     apiKey: GEMINI_API_KEY,
//     model: "gemini-embedding-001",
// });

// ✅ LLM: Por ahora se mantiene Gemini (Voyage AI es solo para embeddings)
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: GEMINI_API_KEY,
});

export function checkApiKey() {
    if (!VOYAGE_API_KEY) {
        console.warn("⚠️ La variable de entorno VOYAGE_API_KEY no está definida. Los embeddings pueden fallar.");
        return false;
    }
    if (!GEMINI_API_KEY) {
        console.warn("⚠️ La variable de entorno GEMINI_API_KEY no está definida. El LLM puede fallar.");
        return false;
    }
    return true;
}
