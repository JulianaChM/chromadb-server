import { initializeApp, getApps, cert, App, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

/**
 * @fileOverview Inicialización de Firebase Admin SDK.
 * Se utiliza para operaciones de servidor como el RAG y la gestión de la base de datos de vectores.
 */

let app: App;

// Obtener la lista de aplicaciones ya inicializadas para evitar duplicados en HMR
const apps = getApps();

if (apps.length === 0) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  // Solo inicializamos con certificado si tenemos las variables necesarias
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
      
      console.log('Firebase Admin SDK inicializado exitosamente.');
    } catch (error: any) {
      console.error('Error al inicializar Firebase Admin con certificado:', error.message);
      // Fallback a inicialización por defecto (útil en entornos de nube)
      app = initializeApp();
    }
  } else {
    console.warn('Advertencia: Faltan variables de entorno de Firebase Admin. Inicializando app por defecto.');
    // Inicialización por defecto (puede fallar si no hay credenciales de entorno de GCP)
    try {
        app = initializeApp();
    } catch (e) {
        // Si todo falla, creamos una referencia nula controlada o lanzamos error descriptivo
        console.error('No se pudo inicializar ninguna instancia de Firebase Admin.');
    }
  }
} else {
  app = apps[0];
}

// Exportamos la instancia de Firestore
// Nota: getFirestore() fallará si 'app' no se inicializó correctamente arriba.
export const db: Firestore = getFirestore(app!);
