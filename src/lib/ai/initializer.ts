// src/lib/ai/initializer.ts
import { bootstrapIncidentEmbeddings } from './bootstrap';

let initialized = false;

export async function initializeApp() {
  if (initialized) {
    return;
  }
  console.log("Iniciando la aplicación y procesos de bootstrap...");
  await bootstrapIncidentEmbeddings();
  initialized = true;
  console.log("Inicialización completada.");
}
