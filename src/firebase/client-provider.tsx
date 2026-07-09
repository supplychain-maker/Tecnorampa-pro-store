'use client';

import React, { useMemo } from 'react';
import { getFirebaseApp, getFirebaseFirestore, getFirebaseAuth } from './config';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const { app, firestore, auth } = useMemo(() => {
    const app = getFirebaseApp();
    const firestore = getFirebaseFirestore(app);
    const auth = getFirebaseAuth(app);
    return { app, firestore, auth };
  }, []);

  return (
    <FirebaseProvider app={app} firestore={firestore} auth={auth}>
      {children}
    </FirebaseProvider>
  );
}
