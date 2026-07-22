import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * CONFIGURACIÓN DE FIREBASE UNIFICADA v3.2
 * Las variables se inyectan desde apphosting.yaml en producción.
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isConfigValid = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined';

export const getFirebaseApp = (): FirebaseApp | null => {
  if (!isConfigValid) {
    if (typeof window !== 'undefined') {
      console.error('Firebase Config Missing: Ensure environment variables are set in App Hosting.');
    }
    return null;
  }
  try {
    return !getApps().length ? initializeApp(firebaseConfig) : getApp();
  } catch (error) {
    console.error('Firebase Initialization Error:', error);
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
