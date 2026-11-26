'use client';

import { useMemo, useState, useEffect } from 'react';
import { useFirestore, useCollection, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Minus, Pencil, Trash2, Eye, EyeOff, Loader2, Factory, Package, ArrowLeft, Clock, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/app/lib/products';
import { INITIAL_PRODUCTS } from '@/app/lib/initial-products';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useRouter } from 'next/navigation';
import { getDirectImageUrl, cn } from '@/lib/utils';

const NEW_HYDRAULIC_UNITS: Partial<Product>[] = [
  {
    name: "Unidad Hidráulica 2 HP 110V",
    slug: "unidad-hidraulica-2-hp",
    mainGroup: "refacciones",
    mainGroupName: "Refacciones Industriales",
    subGroup: "Hidráulica",
    categoryNames: ["Refacciones Industriales", "Hidráulica"],
    price: 15000,
    shortDescription: "Central electrohidráulica compacta de 2 HP a 110 VCA monofásica con depósito vertical de 8 L.",
    description: "Unidad de potencia hidráulica compacta de 2 HP con motor eléctrico a 110 VCA monofásico, depósito vertical integrado de 8 litros y bloque manifold con válvula de retención y alivio. Diseñada para operación continua y confiable en rampas niveladoras de andén, minidocks y mesas de elevación industrial.",
    image: "/products/unidad-hidraulica-2hp.jpg",
    images: ["/products/unidad-hidraulica-2hp.jpg", "/products/ficha-especificaciones-unidades-hidraulicas.jpg"],
    active: true,
    stock: 10,
    deliveryTime: "Entrega Inmediata",
    benefits: [
      "Motor eléctrico industrial de 2 HP de alto par de arranque",
      "Conexión estándar monofásica 110 VCA (18.5 A)",
      "Depósito metálico vertical de 8 L para aceite ISO 46",
      "Manifold integrado con válvula de retención y alivio de presión",
      "Manguera flexible de protección y botonera de control integradas"
    ],
    specs: {
      "Capacidad": "2 HP",
      "Alimentación Eléctrica": "110 VCA",
      "Número de Fases": "1 (Monofásica)",
      "Amperaje": "18.5 A",
      "Watts de Consumo": "1.5 KW",
      "Dimensión Depósito": "58 x 23 x 21 cm",
      "Dimensión Tanque": "93 x 45 x 40 cm",
      "Peso": "94.6 kg",
      "Tipo de Aceite": "ISO 46",
      "Cantidad de Aceite": "8 LTS"
    },
    operationSteps: [
      "Fijar la unidad en posición vertical en la base o muro del andén",
      "Conectar a línea eléctrica monofásica de 110 VCA con fusible para 18.5 A",
      "Cargar depósito con 8 litros de aceite hidráulico ISO 46",
      "Conectar línea de presión y retorno al cilindro hidráulico",
      "Realizar prueba de ciclo de elevación y purgar el circuito"
    ]
  },
  {
    name: "Unidad Hidráulica 3 HP 220V",
    slug: "unidad-hidraulica-3-hp",
    mainGroup: "refacciones",
    mainGroupName: "Refacciones Industriales",
    subGroup: "Hidráulica",
    categoryNames: ["Refacciones Industriales", "Hidráulica"],
    price: 20000,
    shortDescription: "Central electrohidráulica de 3 HP a 220 VCA con tanque industrial de 40 L y mirilla de nivel.",
    description: "Unidad de potencia hidráulica industrial de 3 HP equipada con motor eléctrico a 220 VCA (2 fases), tanque rectangular de acero estructural de 40 litros, indicador de nivel visual, tapón de llenado con respiradero y base con patas de anclaje. Ideal para rampas niveladoras de alta demanda, duplicadores de autos y plataformas elevadoras pesadas.",
    image: "/products/unidad-hidraulica-3hp.jpg",
    images: ["/products/unidad-hidraulica-3hp.jpg", "/products/ficha-especificaciones-unidades-hidraulicas.jpg"],
    active: true,
    stock: 10,
    deliveryTime: "Entrega Inmediata",
    benefits: [
      "Motor eléctrico de 3 HP para servicio industrial continuo",
      "Alimentación a 220 VCA bifásica (16 A)",
      "Tanque de acero de 40 L para óptima disipación térmica",
      "Indicador de nivel visual de aceite exterior integrado",
      "Patas estructurales con barrenos para anclaje firme a piso o base"
    ],
    specs: {
      "Capacidad": "3 HP",
      "Alimentación Eléctrica": "220 VCA",
      "Número de Fases": "2 (Bifásica)",
      "Amperaje": "16 A",
      "Watts de Consumo": "2.25 KW",
      "Dimensión Depósito": "68 x 23 x 21 cm",
      "Dimensión Tanque": "93 x 45 x 40 cm",
      "Peso": "97 kg",
      "Tipo de Aceite": "ISO 46",
      "Cantidad de Aceite": "40 LTS"
    },
    operationSteps: [
      "Anclar la unidad a piso firme mediante los 4 barrenos de las patas estructurales",
      "Conectar a línea bifásica de 220 VCA protegida para 16 A",
      "Llenar tanque con 40 litros de aceite hidráulico ISO 46 verificando el visor de nivel",
      "Conectar líneas hidráulicas de presión y retorno",
      "Encender motor para purgar el sistema y verificar presión de trabajo"
    ]
  },
  {
    name: "Unidad Hidráulica 5 HP 220V Trifásica Evolution",
    slug: "unidad-hidraulica-5-hp",
    mainGroup: "refacciones",
    mainGroupName: "Refacciones Industriales",
    subGroup: "Hidráulica",
    categoryNames: ["Refacciones Industriales", "Hidráulica"],
    price: 25000,
    shortDescription: "Central electrohidráulica industrial de 5 HP a 220 VCA trifásica con tanque de 65 L, manómetro y electroválvula.",
    description: "Unidad de potencia electrohidráulica de alto rendimiento serie Evolution de 5 HP. Configurada con motor trifásico horizontal de alto torque a 220 VCA, tanque de almacenamiento de 65 litros, manifold con manómetro de presión, electroválvula direccional y mirilla visual. Diseñada para operación continua y ciclos pesados en rampas vehiculares, sistemas de elevación múltiple y andenes industriales.",
    image: "/products/unidad-hidraulica-5hp.jpg",
    images: ["/products/unidad-hidraulica-5hp.jpg", "/products/ficha-especificaciones-unidades-hidraulicas.jpg"],
    active: true,
    stock: 10,
    deliveryTime: "Entrega Inmediata",
    benefits: [
      "Motor eléctrico trifásico de 5 HP de alto par y bajo calentamiento",
      "Alimentación trifásica 220 VCA (14 A) de alta eficiencia",
      "Gran tanque de acero de 65 L con mirilla para trabajo continuo",
      "Bloque manifold con manómetro de presión y electroválvula integrados",
      "Diseño horizontal serie Evolution con patas estructurales de anclaje"
    ],
    specs: {
      "Capacidad": "5 HP",
      "Alimentación Eléctrica": "220 VCA",
      "Número de Fases": "3 (Trifásica)",
      "Amperaje": "14 A",
      "Watts de Consumo": "3.73 KW",
      "Dimensión Depósito": "63 x 76 x 48 cm",
      "Peso": "106 kg",
      "Tipo de Aceite": "ISO 46",
      "Cantidad de Aceite": "65 LTS",
      "Instrumentación": "Manómetro de glicerina y visor de nivel incluidos"
    },
    operationSteps: [
      "Montar y anclar la base de la unidad a piso firme y nivelado",
      "Conectar acometida trifásica de 220 VCA con protección térmica calibrada a 14 A",
      "Verificar sentido de rotación del motor eléctrico horizontal",
      "Cargar el tanque con 65 litros de aceite hidráulico anti-desgaste ISO 46",
      "Conectar mangueras de presión/retorno y calibrar presión de alivio con el manómetro"
    ]
  },
  {
    name: "Unidad Hidráulica 7.2 HP 220V Trifásica Tecnorampa",
    slug: "unidad-hidraulica-7-2-hp",
    mainGroup: "refacciones",
    mainGroupName: "Refacciones Industriales",
    subGroup: "Hidráulica",
    categoryNames: ["Refacciones Industriales", "Hidráulica"],
    price: 30000,
    shortDescription: "Central electrohidráulica de alta capacidad 7.2 HP trifásica a 220 VCA, 10.9 GPM, válvula LIFT V3080 y tanque de 90 L.",
    description: "Unidad de potencia electrohidráulica industrial de alta capacidad 7.2 HP Tecnorampa con motor de enfriamiento forzado por aire a 220 VCA trifásico. Equipada con tanque metálico de 90 litros con mirilla de nivel y temperatura, bomba de engranes de alto flujo de 10.9 GPM, bloque de válvulas LIFT V3080 de aluminio con puertos NPT, manómetro de glicerina graduado a 500 psi y filtro de admisión de aceite. Especialmente diseñada para sistemas de andenes pesados, elevación de carga continua y altura máxima de bombeo de hasta 12 metros.",
    image: "/products/unidad-hidraulica-7-2hp.jpg",
    images: ["/products/unidad-hidraulica-7-2hp.jpg", "/products/ficha-especificaciones-unidades-pesadas.jpg"],
    active: true,
    stock: 10,
    deliveryTime: "Entrega Inmediata",
    benefits: [
      "Motor eléctrico de 7.2 HP con enfriamiento forzado por aire para servicio rudo",
      "Bomba de engranes de alto caudal de 10.9 GPM con dren integrado",
      "Válvula direccional LIFT V3080 en aluminio de ingeniería con puertos NPT",
      "Manómetro en baño de glicerina calibrado con escalas de 500 psi",
      "Tanque de acero reforzado de 90 L con mirilla de nivel, temperatura y viscosidad",
      "Filtro de admisión de aceite de alta eficiencia y altura máxima de elevación de 12 m"
    ],
    specs: {
      "Capacidad": "7.2 HP",
      "Alimentación Eléctrica": "220 VCA",
      "Número de Fases": "3 (Trifásica)",
      "Amperaje": "22 A",
      "Watts de Consumo": "5.3 KW",
      "Dimensión Depósito": "75 x 35 x 100 cm",
      "Peso": "205 kg",
      "Tipo de Aceite": "ISO 68",
      "Cantidad de Aceite": "90 LTS",
      "Caudal de Bomba": "10.9 GPM",
      "Válvula de Control": "LIFT V3080 aluminio NPT",
      "Instrumentación": "Manómetro de glicerina 500 psi y visor de nivel/temp"
    },
    operationSteps: [
      "Anclar firmemente el tanque metálico sobre los apoyos estructurales de piso",
      "Conectar acometida trifásica de 220 VCA calibrada para consumo de 22 A",
      "Comprobar el sentido de giro del ventilador de enfriamiento del motor",
      "Rellenar el depósito con 90 litros de aceite hidráulico ISO 68 verificando la mirilla",
      "Conectar puertos NPT de la válvula LIFT V3080 a la red hidráulica del equipo",
      "Presurizar el circuito y calibrar manómetro de glicerina a la presión nominal"
    ]
  },
  {
    name: "Unidad Hidráulica 10 HP 220V Trifásica Tecnorampa",
    slug: "unidad-hidraulica-10-hp",
    mainGroup: "refacciones",
    mainGroupName: "Refacciones Industriales",
    subGroup: "Hidráulica",
    categoryNames: ["Refacciones Industriales", "Hidráulica"],
    price: 35000,
    shortDescription: "Central electrohidráulica de alta potencia 10 HP trifásica a 220 VCA, 7.46 kW, válvula LIFT V3080 y tanque de 85 L.",
    description: "Unidad de potencia electrohidráulica de uso rudo y alto rendimiento de 10 HP Tecnorampa con motor eléctrico horizontal de enfriamiento por aire a 220 VCA trifásico (7.46 kW). Cuenta con tanque reforzado de 85 litros con mirilla visual para nivel, temperatura y viscosidad, bomba de engranes con dren de aceite, bloque de válvulas LIFT V3080 en aluminio con puertos NPT, manómetro en glicerina calibrado a 500 psi y filtro de admisión de aceite. Desarrollada para rampas de servicio pesado, plataformas elevadoras de gran tonelaje y sistemas con altura de bombeo de hasta 12 metros.",
    image: "/products/unidad-hidraulica-10hp.jpg",
    images: ["/products/unidad-hidraulica-10hp.jpg", "/products/ficha-especificaciones-unidades-pesadas.jpg"],
    active: true,
    stock: 10,
    deliveryTime: "Entrega Inmediata",
    benefits: [
      "Motor eléctrico de 10 HP (7.46 kW) con enfriamiento por aire para trabajo continuo",
      "Alimentación trifásica 220 VCA (27 A) de alto rendimiento dinámico",
      "Tanque metálico estructural de 85 L con indicador exterior de nivel y temperatura",
      "Bloque manifold con válvula LIFT V3080 en aluminio y puertos NPT",
      "Manómetro en glicerina para monitoreo exacto de presión hasta 500 psi",
      "Filtro de admisión de aceite para máxima vida útil del sistema hidráulico"
    ],
    specs: {
      "Capacidad": "10 HP",
      "Alimentación Eléctrica": "220 VCA",
      "Número de Fases": "3 (Trifásica)",
      "Amperaje": "27 A",
      "Watts de Consumo": "7.46 KW",
      "Dimensión Depósito": "70 x 40 x 90 cm",
      "Peso": "150 kg",
      "Tipo de Aceite": "ISO 46",
      "Cantidad de Aceite": "85 LTS",
      "Válvula de Control": "LIFT V3080 aluminio NPT",
      "Instrumentación": "Manómetro de glicerina 500 psi y visor de nivel/temp",
      "Altura Máxima": "12 m máx."
    },
    operationSteps: [
      "Fijar y nivelar el tanque estructural sobre la base o fosa designada",
      "Conectar a línea eléctrica trifásica de 220 VCA protegida para 27 A",
      "Verificar el sentido de rotación del motor eléctrico y el flujo de aire de enfriamiento",
      "Llenar el depósito con 85 litros de aceite hidráulico ISO 46 hasta el nivel indicado",
      "Conectar las líneas hidráulicas a los puertos NPT de la válvula LIFT V3080",
      "Realizar ciclo de prueba sin carga para purgar aire y verificar presión de trabajo"
    ]
  },
  {
    name: "Unidad Hidráulica 15 HP 220V Trifásica Tecnorampa",
    slug: "unidad-hidraulica-15-hp",
    mainGroup: "refacciones",
    mainGroupName: "Refacciones Industriales",
    subGroup: "Hidráulica",
    categoryNames: ["Refacciones Industriales", "Hidráulica"],
    price: 40000,
    shortDescription: "Central electrohidráulica de potencia pesada 15 HP trifásica a 220 VCA, 11.19 kW, tanque de 160 L y bomba manual de emergencia.",
    description: "Unidad de potencia electrohidráulica de máxima capacidad 15 HP Tecnorampa con motor eléctrico trifásico a 220 VCA de enfriamiento por aire (11.19 kW). Diseñada para las exigencias más severas de elevación continua en la industria logística. Cuenta con un gran tanque reforzado de 160 litros con indicador de nivel, temperatura y viscosidad, manifold con válvula LIFT V3080 de aluminio NPT, manómetro en glicerina de 500 psi, filtro de admisión de alta pureza, bomba con drenaje de aceite y sistema de palanca/bomba manual de respaldo para descenso o accionamiento de emergencia.",
    image: "/products/unidad-hidraulica-15hp.jpg",
    images: ["/products/unidad-hidraulica-15hp.jpg", "/products/ficha-especificaciones-unidades-pesadas.jpg"],
    active: true,
    stock: 10,
    deliveryTime: "Entrega Inmediata",
    benefits: [
      "Motor industrial trifásico de 15 HP (11.19 kW) con enfriamiento por aire para ciclo continuo",
      "Alimentación trifásica 220 VCA (41 A) de máxima fuerza y torque",
      "Tanque de acero de gran volumen de 160 L para excelente estabilidad térmica",
      "Bomba manual de respaldo con palanca integrada para maniobras de emergencia",
      "Bloque manifold con válvula LIFT V3080 de aluminio y manómetro en baño de glicerina",
      "Mirilla exterior de nivel, temperatura y viscosidad de aceite con alcance hasta 12 m"
    ],
    specs: {
      "Capacidad": "15 HP",
      "Alimentación Eléctrica": "220 VCA",
      "Número de Fases": "3 (Trifásica)",
      "Amperaje": "41 A",
      "Watts de Consumo": "11.19 KW",
      "Dimensión Depósito": "100 x 100 x 120 cm",
      "Peso": "205 kg",
      "Tipo de Aceite": "ISO 46",
      "Cantidad de Aceite": "160 LTS",
      "Válvula de Control": "LIFT V3080 aluminio NPT",
      "Instrumentación": "Manómetro de glicerina 500 psi y visor de nivel/temp",
      "Sistema de Emergencia": "Bomba manual de palanca integrada",
      "Altura Máxima": "12 m máx."
    },
    operationSteps: [
      "Anclar el tanque de 160 L a la base de concreto mediante sus patas estructurales",
      "Conectar a acometida eléctrica trifásica de 220 VCA calibrada para 41 A",
      "Verificar rotación del motor y ventilador de enfriamiento",
      "Rellenar con 160 litros de aceite hidráulico ISO 46 verificando el visor de nivel",
      "Conectar las líneas hidráulicas a los puertos de la válvula LIFT V3080 y verificar la palanca de emergencia",
      "Poner en marcha para purga de aire y calibración de la presión con el manómetro"
    ]
  }
];

export default function AdminProductsPage() {
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const userDocRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile, loading: profileLoading } = useDoc(userDocRef);
  const isAdmin = profile?.role === 'admin';

  const productsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: products, loading: productsLoading } = useCollection<Product>(productsQuery);

  // Auto-sincronizar nombre oficial del resorte a "Resorte de Extensión Amarillo" y descripción industrial limpia
  useEffect(() => {
    if (!products || !isAdmin || !db) return;
    const resorte = products.find(p => p.slug === 'resorte-extension-amarillo-rampa');
    if (resorte && resorte.id && (
      resorte.name !== 'Resorte de Extensión Amarillo' || 
      !resorte.technicalSheetUrl ||
      resorte.description?.includes('vehicular') ||
      resorte.description?.includes('automotriz') ||
      resorte.description?.includes('neumáticos')
    )) {
      const productRef = doc(db, 'products', resorte.id);
      updateDoc(productRef, { 
        name: 'Resorte de Extensión Amarillo',
        description: 'Fabricado bajo especificaciones industriales únicamente. Resorte helicoidal de extensión y tracción lateral en acero aleado Cromo-Silicio ASTM A401 para sistemas de retención de andén electromecánicos tipo gancho (Rhino / Dok-Lok) y niveladoras mecánicas de andén. Acabado en pintura electrostática amarillo industrial RAL 1018 para máxima visibilidad y resistencia a la corrosión.',
        technicalSheetUrl: '/fichas-tecnicas/resorte-extension-amarillo-rampa.pdf'
      }).then(() => {
        console.log('Successfully updated Resorte de Extensión Amarillo in Firestore');
      }).catch(err => {
        console.error('Error auto-syncing resorte:', err);
      });
    }
  }, [products, isAdmin, db]);

  // Auto-sincronizar Unidades Hidráulicas y catálogo si faltan en Firestore
  useEffect(() => {
    if (!products || !isAdmin || !db || productsLoading) return;
    
    for (const unit of INITIAL_PRODUCTS) {
      const exists = products.some(p => p.slug === unit.slug);
      if (!exists) {
        addDoc(collection(db, 'products'), {
          ...unit,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }).then(() => {
          toast({
            title: "Producto sincronizado",
            description: `${unit.name} sincronizado en la base de datos ($${unit.price?.toLocaleString()} MXN).`,
          });
        }).catch(err => {
          console.error(`Error auto-creating ${unit.slug}:`, err);
        });
      }
    }
  }, [products, isAdmin, db, productsLoading, toast]);

  const toggleStatus = (product: Product) => {
    if (!db || !product.id) return;
    const productRef = doc(db, 'products', product.id);
    const newStatus = !product.active;
    
    updateDoc(productRef, { active: newStatus })
      .then(() => {
        toast({ title: "Estado Actualizado", description: `${product.name} ahora está ${newStatus ? 'activo' : 'inactivo'}.` });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: productRef.path,
          operation: 'update',
          requestResourceData: { active: newStatus }
        }));
      });
  };

  const handleQuickStock = (product: Product, newStock: number) => {
    if (!db || !product.id) return;
    const productRef = doc(db, 'products', product.id);
    
    updateDoc(productRef, { stock: newStock })
      .then(() => {
        toast({ 
          title: "Stock Actualizado", 
          description: `${product.name}: ${newStock} unidades en stock (${newStock > 0 ? 'Entrega Inmediata' : 'Sin stock'}).` 
        });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: productRef.path,
          operation: 'update',
          requestResourceData: { stock: newStock }
        }));
      });
  };

  const handleDelete = (product: Product) => {
    if (!db || !product.id || !confirm(`¿Está seguro de eliminar ${product.name}?`)) return;
    const productRef = doc(db, 'products', product.id);
    
    deleteDoc(productRef)
      .then(() => {
        toast({ title: "Producto Eliminar", description: "El equipo ha sido retirado del sistema." });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: productRef.path,
          operation: 'delete'
        }));
      });
  };

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
        <h2 className="text-2xl font-black uppercase tracking-tighter">Acceso Restringido</h2>
        <p className="text-muted-foreground mb-6">Solo personal autorizado puede gestionar el catálogo industrial.</p>
        <Link href="/">
          <Button variant="outline">Volver al Inicio</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 industrial-grid min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="space-y-1">
            <Link href="/" className="text-xs font-black text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 uppercase tracking-[0.2em] mb-4">
              <ArrowLeft size={14} /> Volver a Tienda
            </Link>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic border-l-8 border-primary pl-6">Gestión de Inventario</h1>
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest ml-8">Panel de Administración Tecnorampa</p>
          </div>
          <Link href="/admin/products/new">
            <Button className="h-14 px-8 font-black uppercase tracking-widest text-xs italic shadow-lg">
              <Plus className="mr-2 h-5 w-5" /> AGREGAR NUEVO EQUIPO
            </Button>
          </Link>
        </div>

        <div className="bg-white border border-border rounded-xl shadow-xl overflow-hidden">
          {productsLoading ? (
            <div className="p-20 flex justify-center">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : products.length === 0 ? (
            <div className="p-20 text-center text-muted-foreground italic">
              No hay productos en el catálogo.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest w-[100px]">Imagen</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Producto</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Grupos</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Precio</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Stock / Entrega</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Estado</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px] tracking-widest">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const stock = product.stock ?? 0;
                  return (
                    <TableRow key={product.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="relative w-12 h-12 rounded border bg-muted/20 overflow-hidden">
                          <Image 
                            src={getDirectImageUrl(product.image)} 
                            alt={product.name} 
                            fill 
                            className="object-contain p-1"
                            unoptimized
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-black text-xs uppercase tracking-tight max-w-[200px]">
                        <Link href={`/products/${product.slug}`} className="hover:text-primary transition-colors">
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="text-[9px] w-fit font-bold border-primary/30 text-primary">
                            {product.mainGroupName || 'Sin grupo'}
                          </Badge>
                          {product.subGroup && (
                            <Badge variant="secondary" className="text-[8px] w-fit font-medium">
                              {product.subGroup}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-black text-sm italic text-primary">
                        ${product.price.toLocaleString()} <span className="text-[9px] text-muted-foreground font-normal not-italic">MXN</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border rounded-lg bg-background shadow-xs overflow-hidden">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 rounded-none hover:bg-muted"
                              onClick={() => handleQuickStock(product, Math.max(0, stock - 1))}
                              title="Restar 1 unidad"
                            >
                              <Minus size={12} />
                            </Button>
                            <span className={cn(
                              "px-2.5 text-xs font-black min-w-[28px] text-center",
                              stock > 0 ? "text-emerald-700" : "text-muted-foreground"
                            )}>
                              {stock}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 rounded-none hover:bg-muted"
                              onClick={() => handleQuickStock(product, stock + 1)}
                              title="Sumar 1 unidad"
                            >
                              <Plus size={12} />
                            </Button>
                          </div>

                          {stock > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                              <Zap size={10} className="text-emerald-600" /> Inmediata
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full">
                              <Clock size={10} className="text-primary" /> {product.deliveryTime || '3 a 5 días'}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleStatus(product)}
                          className={cn(
                            "text-[9px] font-black uppercase tracking-wider h-6 px-2.5 rounded-full",
                            product.active 
                              ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20" 
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          )}
                        >
                          {product.active ? 'Activo' : 'Oculto'}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                              <Pencil size={14} />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(product)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
