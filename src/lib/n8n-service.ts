/**
 * @fileOverview Servicio para la integración con flujos de n8n.
 * Maneja la comunicación con LangChain y el sistema RAG configurado en n8n.
 */

export interface N8nChatResponse {
  output: string;
  sourceDocuments?: any[];
  emergencyHistory?: any[];
}

const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'https://tu-instancia.n8n.cloud/webhook/emergency-assistant';

/**
 * Envía una consulta al flujo de n8n para ser procesada por LangChain y el RAG.
 */
export async function sendMessageToN8n(query: string, context?: any): Promise<N8nChatResponse> {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        context,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Error al conectar con n8n');
    }

    const data = await response.json();
    return {
      output: data.output || 'No se recibió respuesta del asistente.',
      sourceDocuments: data.sourceDocuments || [],
      emergencyHistory: data.emergencyHistory || [],
    };
  } catch (error) {
    console.error('Error in n8n integration:', error);
    return {
      output: 'Lo siento, el sistema de inteligencia (n8n) no está respondiendo en este momento.',
    };
  }
}
