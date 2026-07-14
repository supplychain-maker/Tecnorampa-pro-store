
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
 * Valida si la configuración es real. 
 * Si detecta que son placeholders o llaves vacías, retorna falso.
 */
const isValidConfig = () => {
  const key = firebaseConfig.apiKey;
  if (!key || key.length < 20 || !key.startsWith('AIza') || key.includes('undefined')) {
    return false;
  }
  return true;
};

export const getFirebaseApp = (): FirebaseApp | null => {
  // En fase de construcción o sin llaves reales, no inicializamos nada
  if (typeof window === 'undefined' && !isValidConfig()) return null;
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
    // Solo intentamos obtener Auth si el app es válido
    return getAuth(app);
  } catch (error) {
    return null;
  }
};
