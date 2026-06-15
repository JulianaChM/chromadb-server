import { retriever } from "./retriever";
import { llm } from "./gemini";

export async function consultarIncidente(
  pregunta: string
) {

  const docs =
    await retriever.invoke(pregunta);

  const contexto =
    docs.map(d => d.pageContent)
        .join("\n\n");

  const prompt = `
Eres un asistente para operadores
de emergencias hospitalarias.

Historial relevante:

${contexto}

Pregunta:
${pregunta}

Responde usando el contexto.
`;

  const respuesta =
    await llm.invoke(prompt);

  return respuesta.content;
}