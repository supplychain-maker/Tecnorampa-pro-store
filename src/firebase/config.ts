
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Validación ultra-estricta para evitar errores durante el build de Next.js
 */
const isValidConfig = () => {
  const key = firebaseConfig.apiKey;
  if (!key || key === 'undefined' || key.length < 20 || !key.startsWith('AIza')) {
    return false;
  }
  return true;
};

export const getFirebaseApp = (): FirebaseApp | null => {
  // BLOQUEO CRÍTICO: Si no hay llaves reales, NO inicializar. 
  // Esto evita el error auth/invalid-api-key en el servidor de Google Cloud
  if (!isValidConfig()) return null;
  
  try {
    return !getApps().length ? initializeApp(firebaseConfig) : getApp();
  } catch (error) {
    console.error("Firebase init suppressed during build");
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
