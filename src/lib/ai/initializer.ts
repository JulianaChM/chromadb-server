
import { bootstrapIncidentEmbeddings } from './bootstrap';

let initialized = false;

/**
 * Inicialización segura de la aplicación.
 * Captura errores para evitar que el proceso de Next.js se detenga.
 */
export async function initializeApp() {
  if (initialized) {
    return;
  }
  
  console.log("🚀 Iniciando la aplicación y procesos de bootstrap...");
  
  try {
    await bootstrapIncidentEmbeddings();
    initialized = true;
    console.log("✅ Inicialización completada.");
  } catch (error) {
    console.error("❌ Error durante la inicialización de la app:", error);
    // No lanzamos el error para permitir que Next.js siga cargando la UI
  }
}
