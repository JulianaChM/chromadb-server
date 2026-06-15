import { retriever } from "./vector-store";
import { llm } from "./models";
import { Document } from "@langchain/core/documents";

export async function queryIncidents(
  question: string
): Promise<{ answer: string; sourceDocuments: Document['metadata'][] }> {

  const docs = await retriever.invoke(question);

  const context = docs.map(d => d.pageContent).join("\n\n");

  const prompt = `
Eres un asistente experto para operadores de emergencias médicas. Tu tarea es responder preguntas sobre incidentes pasados para ayudar a gestionar nuevas emergencias.

Usa el siguiente historial de incidentes relevantes para construir tu respuesta. Si la respuesta no está en el contexto, indica que no tienes información sobre ello.

Historial relevante:
---
${context}
---

Pregunta:
${question}

Respuesta:
`;

  const response = await llm.invoke(prompt);

  return {
    answer: response.content as string,
    sourceDocuments: docs.map(d => d.metadata)
  };
}
