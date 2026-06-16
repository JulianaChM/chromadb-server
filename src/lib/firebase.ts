
import { initializeApp, getApps, cert, App, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

/**
 * @fileOverview Inicialización segura de Firebase Admin SDK.
 */

let app: App | null = null;
const apps = getApps();

if (apps.length === 0) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (privateKey && clientEmail && projectId) {
    try {
      const serviceAccount: ServiceAccount = {
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      };

      app = initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('✅ Firebase Admin SDK inicializado con credenciales.');
    } catch (error: any) {
      console.error('❌ Error al inicializar Firebase Admin con certificado:', error.message);
      try {
        app = initializeApp();
      } catch (e) {
        app = null;
      }
    }
  } else {
    try {
      app = initializeApp();
      console.log('ℹ️ Firebase Admin SDK inicializado con credenciales de entorno.');
    } catch (e) {
      console.warn('⚠️ No se pudo inicializar Firebase Admin. Algunas funciones de IA (RAG) no estarán disponibles.');
      app = null;
    }
  }
} else {
  app = apps[0];
}

// Exportamos la instancia de Firestore de forma segura
// Si app es null, se lanzará un error solo cuando se intente usar la DB, no al importar el módulo.
export const db: Firestore = app ? getFirestore(app) : (null as unknown as Firestore);
