'use client';

import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, collection, addDoc, serverTimestamp, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Database, ShieldAlert, CheckCircle2, ArrowRight, AlertTriangle, Info, UserCheck, Layers } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const INITIAL_CATEGORIES = [
  // Grupos Principales (Macro)
  { name: "Andén de Carga", slug: "anden", isMainGroup: true, order: 1, icon: "Warehouse" },
  { name: "Estacionamiento", slug: "estacionamiento", isMainGroup: true, order: 2, icon: "Car" },
  { name: "Refacciones Industriales", slug: "refacciones", isMainGroup: true, order: 3, icon: "Wrench" },

  // Subgrupos de Andén de Carga
  { name: "Niveladoras y Mini Docks", slug: "niveladoras-y-mini-docks", mainGroup: "anden", parentName: "Andén de Carga", order: 10 },
  { name: "Seguridad e Iluminación", slug: "seguridad-e-iluminacion", mainGroup: "anden", parentName: "Andén de Carga", order: 11 },
  { name: "Protección de Andén", slug: "proteccion-de-anden", mainGroup: "anden", parentName: "Andén de Carga", order: 12 },

  // Subgrupos de Estacionamiento
  { name: "Duplicadores de Autos", slug: "duplicadores-de-autos", mainGroup: "estacionamiento", parentName: "Estacionamiento", order: 20 },

  // Subgrupos de Refacciones Industriales
  { name: "Mecánicas y Retención", slug: "mecanicas-y-retencion", mainGroup: "refacciones", parentName: "Refacciones Industriales", order: 30 },
  { name: "Hidráulica", slug: "hidraulica", mainGroup: "refacciones", parentName: "Refacciones Industriales", order: 31 },
  { name: "Control y Eléctrico", slug: "control-y-electrico", mainGroup: "refacciones", parentName: "Refacciones Industriales", order: 32 },
  { name: "Baleros y Rodamientos", slug: "baleros-y-rodamientos", mainGroup: "refacciones", parentName: "Refacciones Industriales", order: 33 },
];

import { INITIAL_PRODUCTS } from '@/app/lib/initial-products';
export default function SetupPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<string>('');

  const runSetup = async () => {
    if (!db || !user) return;
    setLoading(true);
    setError(null);
    setStep('Iniciando...');

    try {
      setStep('Configurando perfil de Administrador...');
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        role: 'admin',
        updatedAt: serverTimestamp(),
        firstName: user.displayName?.split(' ')[0] || 'Cliente',
        lastName: user.displayName?.split(' ')[1] || 'Tecnorampa',
        email: user.email,
        uid: user.uid
      }, { merge: true });

      setStep('Eliminando productos anteriores y pruebas...');
      const oldProducts = await getDocs(collection(db, 'products'));
      for (const oldDoc of oldProducts.docs) {
        await deleteDoc(oldDoc.ref);
      }

      setStep('Reestructurando grupos y subgrupos...');
      const oldCategories = await getDocs(collection(db, 'categories'));
      for (const oldCatDoc of oldCategories.docs) {
        await deleteDoc(oldCatDoc.ref);
      }

      const catMap = new Map<string, string>();
      for (const cat of INITIAL_CATEGORIES) {
        const docRef = await addDoc(collection(db, 'categories'), {
          ...cat,
          createdAt: serverTimestamp()
        });
        catMap.set(cat.name, docRef.id);
      }

      setStep('Cargando los 21 productos en sus grupos correspondientes...');
      for (const product of INITIAL_PRODUCTS) {
        const categoryIds = (product.categoryNames || [])
          .map(name => catMap.get(name))
          .filter((id): id is string => !!id);

        await addDoc(collection(db, 'products'), {
          ...product,
          stock: (product as any).stock ?? 0,
          deliveryTime: (product as any).deliveryTime || '3 a 5 días hábiles',
          categoryIds,
          categoryId: categoryIds[0] || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      setSuccess(true);
      setStep('¡Catálogo Restaurado con Éxito con 3 Grupos y Subgrupos!');
    } catch (err: any) {
      console.error("Setup error:", err);
      setError(err.message || 'Error desconocido. Revisa las reglas de Firestore.');
    } finally {
      setLoading(false);
    }
  };

  const addHydraulicUnit2HP = async () => {
    if (!db || !user) return;
    setLoading(true);
    setError(null);
    setStep('Agregando Unidad Hidráulica 2 HP al catálogo...');

    try {
      const existing = await getDocs(query(collection(db, 'products'), where('slug', '==', 'unidad-hidraulica-2-hp')));
      if (!existing.empty) {
        setStep('La Unidad Hidráulica 2 HP ya existe en el catálogo.');
        setSuccess(true);
        return;
      }

      const catsSnap = await getDocs(collection(db, 'categories'));
      let hidraulicaCatId: string | null = null;
      let refaccionesCatId: string | null = null;

      for (const catDoc of catsSnap.docs) {
        const data = catDoc.data();
        if (data.name === 'Hidráulica') hidraulicaCatId = catDoc.id;
        if (data.name === 'Refacciones Industriales') refaccionesCatId = catDoc.id;
      }

      const categoryIds = [refaccionesCatId, hidraulicaCatId].filter((id): id is string => !!id);
      const prodDef = INITIAL_PRODUCTS.find(p => p.slug === 'unidad-hidraulica-2-hp');

      if (prodDef) {
        await addDoc(collection(db, 'products'), {
          ...prodDef,
          categoryIds,
          categoryId: categoryIds[0] || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      setSuccess(true);
      setStep('¡Unidad Hidráulica 2 HP agregada exitosamente!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al agregar la unidad hidráulica');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  if (!user) {
    return (
      <div className="container mx-auto py-20 text-center max-w-lg px-4">
        <Card className="border-2 border-dashed">
          <CardHeader>
            <ShieldAlert className="mx-auto mb-2 text-primary" size={48} />
            <CardTitle className="text-2xl font-black uppercase">Sesión Requerida</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">Debes estar logueado para cargar el catálogo completo.</p>
            <Link href="/login?redirect=/setup">
              <Button size="lg" className="w-full font-black uppercase">Ir a Iniciar Sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-20 max-w-2xl px-4">
      <Card className="border-t-8 border-t-primary shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="text-primary" size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Sesión activa: {user.email}</span>
          </div>
          <CardTitle className="text-3xl font-black italic uppercase flex items-center gap-3">
            <Database className="text-primary" /> Setup Catálogo Jerárquico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="font-black uppercase text-xs">Error detectado</AlertTitle>
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {!success ? (
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
                <p className="font-bold flex items-center gap-2">
                  <Layers className="text-primary" size={18} /> Reorganización en 3 Macro-Grupos:
                </p>
                <ul className="text-xs list-disc pl-5 space-y-1 text-muted-foreground font-medium">
                  <li><strong>Andén de Carga</strong>: Niveladoras, Mini Docks, Seguridad, Topes</li>
                  <li><strong>Estacionamiento</strong>: Duplicadores de autos TR Evolution y Parking Lift</li>
                  <li><strong>Refacciones Industriales</strong>: Freno Auto-Release, Resorte, Válvula Parker, Botoneras Schneider y Baleros</li>
                  <li className="text-destructive font-bold">Producto de prueba Stripe eliminado permanentemente (Total: 21 productos).</li>
                </ul>
              </div>
              
              {loading && (
                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded border border-primary/20">
                  <Loader2 className="animate-spin text-primary" size={16} />
                  <span className="text-xs font-bold uppercase">{step}</span>
                </div>
              )}

              <Button onClick={runSetup} className="w-full h-16 font-black text-lg uppercase italic shadow-xl" disabled={loading}>
                {loading ? "RESTAURANDO..." : "RESTAURAR CATÁLOGO COMPLETO"}
              </Button>

              <Button onClick={addHydraulicUnit2HP} variant="outline" className="w-full h-14 font-black text-sm uppercase italic border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-md" disabled={loading}>
                ⚡ AGREGAR SÓLO UNIDAD HIDRÁULICA 2 HP ($15,000)
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-8 py-6">
              <CheckCircle2 className="mx-auto text-green-500" size={64} />
              <h3 className="text-2xl font-black uppercase italic">¡Catálogo Restaurado!</h3>
              <p className="text-muted-foreground text-sm">
                Se han organizado los 21 productos en Andén, Estacionamiento y Refacciones con sus respectivos subgrupos.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/products" className="w-full">
                  <Button variant="outline" className="w-full font-black uppercase">Ver Tienda</Button>
                </Link>
                <Link href="/" className="w-full">
                  <Button className="w-full font-black uppercase">Ir al Inicio</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
