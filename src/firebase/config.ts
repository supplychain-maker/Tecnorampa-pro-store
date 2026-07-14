
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
 * Valida de forma extrema si la configuración es real.
 * Si el API Key es un placeholder o no empieza con AIza, lo ignora.
 */
const isValidConfig = () => {
  const key = firebaseConfig.apiKey;
  if (!key || key === 'undefined' || key === 'null' || key.length < 20) return false;
  return key.startsWith('AIza');
};

export const getFirebaseApp = (): FirebaseApp | null => {
  // NUNCA inicializar durante la fase de 'build' en el servidor si la config no es perfecta
  if (typeof window === 'undefined') {
    if (!isValidConfig()) return null;
  }
  
  if (!isValidConfig()) return null;
  
  try {
    return !getApps().length ? initializeApp(firebaseConfig) : getApp();
  } catch (error) {
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
