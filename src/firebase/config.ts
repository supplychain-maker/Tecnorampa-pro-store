import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * CONFIGURACIÓN DE FIREBASE BLINDADA v2.3
 * Evita que Firebase se inicialice durante la compilación de Next.js (build)
 * si no hay llaves válidas, previniendo errores críticos de App Hosting.
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Verificación ultra-estricta de entorno
const isSafeToInit = () => {
  if (typeof window === 'undefined') {
    const key = firebaseConfig.apiKey;
    // Si estamos en el servidor (build), verificamos que la llave no sea un placeholder
    return !!key && key.length > 20 && !key.includes('YOUR_') && key !== 'undefined';
  }
  return true; // En el navegador siempre intentamos
};

export const getFirebaseApp = (): FirebaseApp | null => {
  if (!isSafeToInit()) return null;
  
  try {
    return !getApps().length ? initializeApp(firebaseConfig) : getApp();
  } catch (error) {
    console.error("Firebase init error blocked.");
    return null;
  }
};

export const getFirebaseFirestore = (app: FirebaseApp | null): Firestore | null => {
  if (!app) return null;
  try {
    return getFirestore(app);
  } catch (error) {
    return null;
  }
};

export const getFirebaseAuth = (app: FirebaseApp | null): Auth | null => {
  if (!app) return null;
  try {
    return getAuth(app);
  } catch (error) {
    return null;
  }
};
