const N8N_WEBHOOK_URL = 'https://linita22-3.app.n8n.cloud/webhook/emergencias';

export interface N8nNotification {
  tipo: string;
  estado: string;
  incidente_id: string;
  descripcion: string;
  prioridad: string;
  ambulancia_placa: string;
  nombre_paciente: string;
  lat: number;
  lng: number;
  hospital_nombre?: string;
  creado_en: string;
}

export async function notifyN8nWebhook(payload: N8nNotification): Promise<boolean> {
  try {
    console.log('📤 Notificando a n8n:', payload);
    
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error(`❌ Error en webhook n8n: ${response.status}`, await response.text());
      return false;
    }

    console.log('✅ Notificación enviada a n8n correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al notificar a n8n:', error);
    return false;
  }
}