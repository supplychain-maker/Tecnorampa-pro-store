
'use client';

import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, collection, addDoc, serverTimestamp, getDocs, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Database, ShieldAlert, CheckCircle2, ArrowRight, AlertTriangle, Info, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const INITIAL_PRODUCTS = [
  {
    name: "Producto de Prueba Stripe",
    slug: "test-stripe-product",
    categoryNames: ["Pruebas"],
    price: 1,
    shortDescription: "Producto de $1 para pruebas de pago seguro.",
    description: "Este es un producto ficticio con valor de $1 MXN creado específicamente para validar la integración con la pasarela de pagos Stripe y la generación de órdenes en Firestore.",
    image: "https://picsum.photos/seed/stripe-test/800/600",
    images: ["https://picsum.photos/seed/stripe-test/800/600"],
    active: true,
    benefits: ["Validación de pasarela", "Prueba de centavos en Stripe", "Verificación de webhook"],
    specs: { "Valor": "$1.00 MXN", "Tipo": "Digital/Prueba" },
    operationSteps: ["Añadir al carrito", "Proceder al checkout", "Usar tarjeta de prueba 4242"]
  },
  {
    name: "Niveladora Hidráulica de Andén",
    slug: "niveladora-hidraulica-premium",
    categoryNames: ["Rampas", "Equipos de Andén"],
    price: 125000,
    shortDescription: "Operación automática con un solo botón. Capacidad de 30k a 50k lbs.",
    description: "La niveladora hidráulica de Tecnorampa ofrece la máxima eficiencia y seguridad. Su sistema electro-hidráulico elimina el esfuerzo manual y reduce el mantenimiento significativamente.",
    image: "https://lh3.googleusercontent.com/d/1OnmLSVRZVsaBKHlIi_V4IsHhJ4RrSGvV",
    images: ["https://lh3.googleusercontent.com/d/1OnmLSVRZVsaBKHlIi_V4IsHhJ4RrSGvV"],
    active: true,
    benefits: ["Operación manos libres", "Mantenimiento mínimo", "Seguridad estructural superior"],
    specs: { "Capacidad Max": "50,000 lbs", "Operación": "Hidráulica", "Garantía": "12 meses" },
    operationSteps: ["Verificar posicionamiento", "Presionar botón elevación", "Extensión automática"],
    variants: [
      { id: "h-30-16", name: "30,000 lbs - Labio 16\"", priceModifier: 0 },
      { id: "h-40-16", name: "40,000 lbs - Labio 16\"", priceModifier: 15000 },
      { id: "h-30-18", name: "30,000 lbs - Labio 18\"", priceModifier: 8000 }
    ]
  },
  {
    name: "Niveladora Mecánica de Andén",
    slug: "niveladora-mecanica-industrial",
    categoryNames: ["Rampas", "Equipos de Andén"],
    price: 95000,
    shortDescription: "Operación manual robusta mediante cadena y resortes de alta tensión.",
    description: "Solución confiable y de bajo costo operativo. Fabricada con acero estructural de alta resistencia, diseñada para soportar tráfico pesado constante.",
    image: "https://lh3.googleusercontent.com/d/1Vr6or92_otUzLfLMaWoHpXBwpspb1n0d",
    images: ["https://lh3.googleusercontent.com/d/1Vr6or92_otUzLfLMaWoHpXBwpspb1n0d"],
    active: true,
    benefits: ["Sin consumo eléctrico", "Altamente resistente", "Fácil mantenimiento"],
    specs: { "Capacidad": "30,000 lbs", "Sistema": "Mecánico por cadena", "Material": "Acero Estructural" },
    operationSteps: ["Jalar cadena de liberación", "Caminar sobre la rampa", "Asentamiento en remolque"],
    variants: [
      { id: "m-30-16", name: "30,000 lbs - Labio 16\"", priceModifier: 0 },
      { id: "m-40-16", name: "40,000 lbs - Labio 16\"", priceModifier: 12000 }
    ]
  },
  {
    name: "Mini Dock Hidráulico",
    slug: "mini-dock-hidraulico",
    categoryNames: ["Mini Docks", "Equipos de Andén"],
    price: 65000,
    shortDescription: "Compacto y automático. Ideal para renovaciones de andenes existentes.",
    description: "Se instala directamente en el borde del andén sin necesidad de fosa profunda. Operación electro-hidráulica de un solo toque.",
    image: "https://lh3.googleusercontent.com/d/1LMVZcXnswjpUyDD-ITyqOsQKuFloJUHr",
    images: [
      "https://lh3.googleusercontent.com/d/1LMVZcXnswjpUyDD-ITyqOsQKuFloJUHr",
      "https://lh3.googleusercontent.com/d/1djDAfRNiCHTfN68du2cm8X7pyHt3PySR",
      "https://lh3.googleusercontent.com/d/1WJPlItAwHvdDIoKV6iD5u_LZeX40l7rk"
    ],
    active: true,
    benefits: ["Instalación rápida", "Operación con botón", "Ahorro de espacio"],
    specs: { "Capacidad": "30,000 lbs", "Ancho": "66\" / 72\"", "Motor": "1 HP" },
    operationSteps: ["Alinear camión", "Activar nivelación", "Verificar contacto"],
    variants: [
      { id: "md-h-66", name: "Ancho 66\" - 30k lbs", priceModifier: 0 },
      { id: "md-h-72", name: "Ancho 72\" - 30k lbs", priceModifier: 5500 }
    ]
  },
  {
    name: "Mini Dock Mecánico",
    slug: "mini-dock-mecanico",
    categoryNames: ["Mini Docks", "Equipos de Andén"],
    price: 45000,
    shortDescription: "La solución más económica y rápida para nivelar andenes.",
    description: "Niveladora de orilla de andén manual. Se acciona mediante una palanca, ideal para operaciones ligeras y medias sin suministro eléctrico.",
    image: "https://lh3.googleusercontent.com/d/1SPv_oOqflDA3RfrarRdGvF3jiEIbkvSm",
    images: [
      "https://lh3.googleusercontent.com/d/1SPv_oOqflDA3RfrarRdGvF3jiEIbkvSm",
      "https://lh3.googleusercontent.com/d/1zpSvdCjwm53ePHSkXr6WY37xlhYupYmI",
      "https://lh3.googleusercontent.com/d/1If7SEwYlWmpL4uSH1B41kp0BPA7bVTc6"
    ],
    active: true,
    benefits: ["Cero electricidad", "Precio competitivo", "Mantenimiento simple"],
    specs: { "Capacidad": "30,000 lbs", "Operación": "Manual con palanca", "Labio": "16\"" },
    operationSteps: ["Insertar palanca", "Jalar hacia atrás", "Empujar hacia adelante"],
    variants: [
      { id: "md-m-66", name: "Ancho 66\" - 30k lbs", priceModifier: 0 },
      { id: "md-m-72", name: "Ancho 72\" - 30k lbs", priceModifier: 4200 }
    ]
  },
  {
    name: "Rampa Estacionamiento TR Evolution",
    slug: "rampa-parking-evolution",
    categoryNames: ["Estacionamiento"],
    price: 185000,
    shortDescription: "Premium. Duplica tu espacio de estacionamiento con máxima seguridad.",
    description: "Sistema de elevación de alta gama. Permite abrir las puertas del auto completamente gracias a su diseño de postes delgados pero ultra resistentes.",
    image: "https://lh3.googleusercontent.com/d/1tj2QGoSA0MziPAU8FwnR6k2ZzbKUqmyb",
    images: ["https://lh3.googleusercontent.com/d/1tj2QGoSA0MziPAU8FwnR6k2ZzbKUqmyb"],
    active: true,
    benefits: ["Ahorro de espacio", "IP Protection (Exterior)", "Alta estética"],
    specs: { "Capacidad": "7,000 lbs", "Protección": "IP65", "Seguro": "Bloqueo mecánico automático" },
    operationSteps: ["Posicionar auto", "Girar llave de ascenso", "Verificar bloqueos"]
  },
  {
    name: "Rampa Parking Lift",
    slug: "rampa-parking-lift",
    categoryNames: ["Estacionamiento"],
    price: 145000,
    shortDescription: "Robusta y funcional para condominios y residencias.",
    description: "Solución de elevación electro-hidráulica para dos autos. Ideal para garajes con techos altos que buscan optimizar el área de parqueo.",
    image: "https://lh3.googleusercontent.com/d/1GdpJDMn0j0Q-1dCaGKp7BurerlQmZHAR",
    images: ["https://lh3.googleusercontent.com/d/1GdpJDMn0j0Q-1dCaGKp7BurerlQmZHAR"],
    active: true,
    benefits: ["Operación silenciosa", "Estructura de acero", "Fácil de usar"],
    specs: { "Capacidad": "6,000 lbs", "Tiempo ascenso": "45 seg", "Voltaje": "220V" },
    operationSteps: ["Estacionar en plataforma", "Activar mando eléctrico", "Asegurar posición"]
  },
  {
    name: "Semáforo de Andén LED",
    slug: "semaforo-led-industrial",
    categoryNames: ["Seguridad", "Señalización"],
    price: 8500,
    shortDescription: "Señalización roja/verde de alta visibilidad para maniobras seguras.",
    description: "Controla el flujo de camiones en tu andén. Carcasa de policarbonato resistente a impactos y LED de larga duración.",
    image: "https://lh3.googleusercontent.com/d/1568T4cpn4B6QnskbqgI4b5oICkt8oV8t",
    images: ["https://lh3.googleusercontent.com/d/1568T4cpn4B6QnskbqgI4b5oICkt8oV8t"],
    active: true,
    benefits: ["Bajo consumo", "Alta visibilidad diurna", "Protección IP65"],
    specs: { "Material": "Policarbonato", "Iluminación": "LED Dual", "Voltaje": "110V/220V" },
    operationSteps: ["Montaje en muro", "Conexión a control", "Sincronización"]
  },
  {
    name: "Lámpara de Andén Articulada",
    slug: "lampara-anden-articulada",
    categoryNames: ["Iluminación", "Equipos de Andén"],
    price: 4500,
    shortDescription: "Ilumina el interior de los trailers para cargas seguras.",
    description: "Brazo articulado de 40 pulgadas con cabezal LED de alta potencia. Resistente a vibraciones y golpes típicos del área de carga.",
    image: "https://lh3.googleusercontent.com/d/1Uic5BVA-nQ_lkKIwcVSeLjZWqhASLsyG",
    images: ["https://lh3.googleusercontent.com/d/1Uic5BVA-nQ_lkKIwcVSeLjZWqhASLsyG"],
    active: true,
    benefits: ["Brazo flexible", "LED de alto brillo", "Resistente a impactos"],
    specs: { "Largo Brazo": "40\"", "Cabezal": "Aluminio", "Vida útil": "50,000 hrs" },
    operationSteps: ["Instalar cerca del andén", "Ajustar ángulo", "Encender para carga"]
  },
  {
    name: "Tope de Andén Reforzado",
    slug: "tope-anden-acero",
    categoryNames: ["Protección", "Accesorios"],
    price: 2500,
    shortDescription: "Protección con cara de acero para tráfico rudo de trailers.",
    description: "El tope de andén definitivo. Incluye una placa de acero frontal que evita el patrimonio prematuro del hule por la fricción de la suspensión del trailer.",
    image: "https://lh3.googleusercontent.com/d/1KmevvDfJduxXuVdcaszS3ZEE_qF3MxwH",
    images: ["https://lh3.googleusercontent.com/d/1KmevvDfJduxXuVdcaszS3ZEE_qF3MxwH"],
    active: true,
    benefits: ["Larga duración", "Absorción de impacto", "Fácil anclaje"],
    specs: { "Material": "Hule laminado y acero", "Medida": "10\" x 12\" x 4\"", "Peso": "15 kg" },
    operationSteps: ["Perforar concreto", "Insertar taquetes expansivos", "Apretar tornillería"]
  },
  {
    name: "Tope de Andén Laminado",
    slug: "tope-anden-laminado",
    categoryNames: ["Protección", "Accesorios"],
    price: 1800,
    shortDescription: "Protección estándar de hule laminado para andenes.",
    description: "Absorción de impactos eficiente para trailers estándar. Fabricado con neumáticos reciclados de alta densidad.",
    image: "https://lh3.googleusercontent.com/d/1JQyUblYuT0fNwsLnjnMKX6xZQe8F8qYT",
    images: ["https://lh3.googleusercontent.com/d/1JQyUblYuT0fNwsLnjnMKX6xZQe8F8qYT"],
    active: true,
    benefits: ["Económico", "Sustentable", "Efectivo"],
    specs: { "Material": "Hule reciclado", "Instalación": "Anclaje mecánico", "Dureza": "70 Shore A" },
    operationSteps: ["Marcar barrenos", "Fijar al muro del andén", "Verificar firmeza"]
  }
];

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

      setStep('Eliminando productos anteriores...');
      const oldProducts = await getDocs(collection(db, 'products'));
      for (const oldDoc of oldProducts.docs) {
        await deleteDoc(oldDoc.ref);
      }

      setStep('Cargando nuevos productos con categorías múltiples...');
      for (const product of INITIAL_PRODUCTS) {
        await addDoc(collection(db, 'products'), {
          ...product,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      setSuccess(true);
      setStep('¡Catálogo Maestro Restaurado!');
    } catch (err: any) {
      console.error("Setup error:", err);
      setError(err.message || 'Error desconocido. Revisa las reglas de Firestore.');
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
            <Database className="text-primary" /> Setup Industrial Pro
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
              <div className="bg-muted p-4 rounded-lg text-sm italic">
                Este proceso restaurará los **11 productos** con soporte para múltiples grupos industriales y galerías completas.
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
            </div>
          ) : (
            <div className="text-center space-y-8 py-6">
              <CheckCircle2 className="mx-auto text-green-500" size={64} />
              <h3 className="text-2xl font-black uppercase italic">¡Catálogo Restaurado!</h3>
              <p className="text-muted-foreground text-sm">Ya puedes ver las opciones industriales con sus galerías y grupos múltiples.</p>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/products" className="w-full">
                  <Button variant="outline" className="w-full font-black uppercase">Ver Tienda</Button>
                </Link>
                <Link href="/admin/products" className="w-full">
                  <Button className="w-full font-black uppercase">Gestionar</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
