/**
 * Servicio para enviar actualizaciones a n8n webhook
 */

export interface N8nIncidenciaUpdate {
  tipo: 'ACTUALIZAR';
  estado: 'EN_RUTA' | 'EN_PROCESO' | 'TERMINADO';
  incidente_id: string;
  descripcion: string;
  prioridad: string;
  ambulancia_placa: string;
  nombre_paciente: string;
  lat: number;
  lng: number;
  hospital_nombre: string;
  creado_en: any;
}

const N8N_WEBHOOK_URL = 'https://linita22-3.app.n8n.cloud/webhook-test/emergencias';

/**
 * Envía una actualización de incidencia al webhook de n8n
 * @param data - Datos de la incidencia actualizada
 */
export async function sendIncidenciaToN8n(data: N8nIncidenciaUpdate): Promise<void> {
  try {
    const payload = {
      tipo: data.tipo,
      estado: data.estado,
      incidente_id: data.incidente_id,
      descripcion: data.descripcion,
      prioridad: data.prioridad,
      ambulancia_placa: data.ambulancia_placa,
      nombre_paciente: data.nombre_paciente,
      lat: data.lat,
      lng: data.lng,
      hospital_nombre: data.hospital_nombre,
      creado_en: data.creado_en,
    };

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`[n8n Webhook] Error ${response.status}:`, await response.text());
      throw new Error(`n8n webhook error: ${response.status}`);
    }

    console.log('[n8n Webhook] ✓ Incidencia actualizada enviada:', payload);
  } catch (error) {
    console.error('[n8n Webhook] Error al enviar datos:', error);
    // No lanzar excepción para no interrumpir el flujo principal
  }
}
