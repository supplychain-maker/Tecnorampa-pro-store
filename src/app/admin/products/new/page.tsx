'use client';

import { ProductForm } from '../form';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useMemo } from 'react';
import { Loader2, Factory } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NewProductPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();

  const userDocRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile, loading: profileLoading } = useDoc(userDocRef);
  const isAdmin = profile?.role === 'admin';

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <Factory size={64} className="text-muted-foreground mb-4 opacity-20" />
        <h2 className="text-2xl font-black uppercase tracking-tighter">Acceso Denegado</h2>
        <Link href="/">
          <Button variant="outline" className="mt-4">Volver al Inicio</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 industrial-grid min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-12">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic border-l-8 border-primary pl-6">Registrar Nuevo Equipo</h1>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-2 ml-8">Añadir producto al ecosistema digital Tecnorampa</p>
        </header>

        <ProductForm />
      </div>
    </div>
  );
}
