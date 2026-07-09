'use client';

import { use, useMemo } from 'react';
import { ProductForm } from '../../form';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2, Factory, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Product } from '@/app/lib/products';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();

  const userDocRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile, loading: profileLoading } = useDoc(userDocRef);
  const isAdmin = profile?.role === 'admin';

  const productDocRef = useMemo(() => {
    if (!db || !id) return null;
    return doc(db, 'products', id);
  }, [db, id]);

  const { data: product, loading: productLoading, error: productError } = useDoc<Product>(productDocRef);

  if (authLoading || profileLoading || productLoading) {
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

  if (!product) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle size={64} className="text-destructive mb-4" />
        <h2 className="text-2xl font-black uppercase tracking-tighter">Producto no Encontrado</h2>
        <Link href="/admin/products">
          <Button variant="outline" className="mt-4">Volver al Listado</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 industrial-grid min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-12">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic border-l-8 border-primary pl-6">Editar Especificaciones</h1>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-2 ml-8">Actualizando: {product.name}</p>
        </header>

        <ProductForm initialData={{ ...product, id }} />
      </div>
    </div>
  );
}
