'use client';

import { use, useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, ShoppingCart, ShieldCheck, Lightbulb, PackageCheck, MapPin, Loader2, MessageSquareText, FileText, ArrowLeft, Minus, Plus, Clock, Zap, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Product } from '@/app/lib/products';
import { getDirectImageUrl, cn } from '@/lib/utils';
import { ProductTechnicalSheet } from '@/components/products/ProductTechnicalSheet';

// Secondary images mapping by product slug (angles, blueprints, details)
const SECONDARY_IMAGES_MAP: Record<string, string[]> = {
  'tope-anden-acero': [
    '/products/tope-acero-lateral.png',
    '/products/tope-acero-medidas.png',
    '/fichas-tecnicas/diagrama-tope-acero.png',
  ],
  'tope-anden-laminado': [
    '/products/tope-laminado-lateral.png',
    '/products/tope-laminado-medidas-1.png',
    '/products/tope-laminado-medidas-2.png',
    '/fichas-tecnicas/diagrama-tope-laminado.png',
  ],
  'lampara-anden-articulada': [
    '/products/lampara-anden-brazo.png',
    '/products/lampara-anden-planos.png',
    '/products/lampara-anden-sin-clavija.jpg',
  ],
  'semaforo-led-industrial': [
    '/products/semaforo-led-frente.png',
    '/products/semaforo-led-planos.png',
  ],
  'niveladora-hidraulica-premium': [
    '/products/niveladora-hidraulica-angulo.jpg',
    '/products/niveladora-hidraulica-cerrada.jpg',
  ],
  'niveladora-mecanica-industrial': [
    '/products/niveladora-mecanica-angulo.jpg',
    '/products/niveladora-hidraulica-cerrada.jpg',
  ],
  'rampa-parking-evolution': [
    '/products/rampa-evolution-2.jpg',
    '/products/rampa-evolution-3.jpg',
  ],
  'rampa-parking-lift': [
    '/products/rampa-parking-lift-2.jpg',
    '/products/rampa-parking-lift-3.jpg',
  ],
  'mini-dock-hidraulico': [
    '/products/mini-dock-hidraulico-2.jpg',
    '/products/mini-dock-hidraulico-3.jpg',
  ],
  'mini-dock-mecanico': [
    '/products/mini-dock-mecanico-2.jpg',
    '/products/mini-dock-mecanico-3.jpg',
  ],
  'mecanismo-freno-rampa-auto-release': [
    '/products/freno-rampa-zoom.jpeg',
  ],
  'resorte-extension-amarillo-rampa': [
    '/products/resorte-rampa-lado.jpeg',
    '/fichas-tecnicas/diagrama-resorte-extension-clean.png',
  ],
  'resorte-extension-niveladora': [
    '/products/resorte-rampa-lado.jpeg',
    '/fichas-tecnicas/diagrama-resorte-extension-clean.png',
  ],
  'poleas-guia-cable-traccion': [
    '/products/poleas-industriales-lado1.jpeg',
    '/products/poleas-industriales-lado2.jpeg',
  ],
  'poleas-industriales-cable-acero': [
    '/products/poleas-industriales-lado1.jpeg',
    '/products/poleas-industriales-lado2.jpeg',
  ],
  'valvula-solenoide-parker': [
    '/products/valvula-parker-lado1.jpeg',
    '/products/valvula-parker-lado2.jpeg',
  ],
  'botonera-colgante-banana': [
    '/products/botonera-banana-lado1.jpeg',
    '/products/botonera-banana-lado2.jpeg',
  ],
  'boton-paro-emergencia-giro': [
    '/products/paro-emergencia-giro-lado.jpeg',
  ],
  'boton-paro-emergencia-llave': [
    '/products/paro-emergencia-llave-lado1.jpeg',
    '/products/paro-emergencia-llave-lado2.jpeg',
  ],
  'caja-din-mando-bipolar': [
    '/products/caja-din-abierta.jpeg',
  ],
  'balero-contacto-angular-5205': [
    '/products/balero-5205-lado.jpeg',
  ],
  'balero-rigido-bolas-6005': [
    '/products/balero-6005-lado.jpeg',
  ],
  'rodamiento-rodillos-ncf2208': [
    '/products/rodamiento-ncf2208-dentro.jpeg',
    '/products/rodamiento-ncf2208-lado.jpeg',
  ],
};

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const db = useFirestore();
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const productQuery = useMemo(() => {
    if (!db || !slug) return null;
    return query(collection(db, 'products'), where('slug', '==', slug), limit(1));
  }, [db, slug]);

  const { data: products, loading } = useCollection<Product>(productQuery);
  const product = products?.[0];

  useEffect(() => {
    if (product && product.variants && product.variants.length > 0 && !selectedVariant) {
      setSelectedVariant(product.variants[0].id);
    }
  }, [product, selectedVariant]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const productName = product.slug === 'resorte-extension-amarillo-rampa'
    ? 'Resorte de Extensión Amarillo'
    : product.name;

  const currentVariant = product.variants?.find(v => v.id === selectedVariant);
  const finalPrice = product.price + (currentVariant?.priceModifier || 0);
  const stock = Number(product.stock ?? 0);
  const deliveryTime = (product.deliveryTime || '').trim() || '3 a 5 días hábiles';
  const hasImmediateStock = stock > 0;

  // Galería de imágenes: Posición 1 garantizada con la imagen de portada, y desde la posición 2 en adelante planos, ángulos y detalles
  const coverImage = getDirectImageUrl(product.image);
  const dbImages = (product.images && product.images.length > 0) 
    ? product.images.map(img => getDirectImageUrl(img))
    : [];
  const secondaryConfigImages = SECONDARY_IMAGES_MAP[slug] || [];

  const imagesToDisplay = [
    coverImage,
    ...dbImages.filter(img => img && img !== coverImage),
    ...secondaryConfigImages.filter(img => img && img !== coverImage && !dbImages.includes(img))
  ];

  const handleAddToCart = () => {
    addItem({
      id: product.id || product.slug,
      name: productName,
      price: finalPrice,
      quantity: quantity,
      image: product.image,
      variant: currentVariant ? currentVariant.name : undefined,
      stock: product.stock,
      deliveryTime: product.deliveryTime
    });

    let toastDesc = `${quantity}x ${productName}${currentVariant ? ` (${currentVariant.name})` : ''} se ha añadido correctamente.`;
    if (hasImmediateStock && quantity > stock) {
      toastDesc = `Añadido: ${stock} en entrega inmediata y ${quantity - stock} en ${deliveryTime}.`;
    }

    toast({
      title: "Agregado al carrito",
      description: toastDesc,
    });
  };

  return (
    <div className="py-8 md:py-12 bg-background">
      <div className="container mx-auto px-4">
        {/* Botón de Regreso Inteligente con restauración de posición */}
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-primary" />
          <span>Volver al Catálogo</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-xl overflow-hidden border border-border group p-8">
              <Image 
                src={imagesToDisplay[activeImage] || imagesToDisplay[0] || coverImage} 
                alt={productName} 
                fill 
                priority
                className="object-contain transition-transform duration-500 hover:scale-105 p-4"
                data-ai-hint="industrial product high detail"
                unoptimized
              />
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest">
                  ALTA DEFINICIÓN
                </Badge>
              </div>
            </div>
            {imagesToDisplay.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                {imagesToDisplay.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(idx)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all bg-white p-2 ${activeImage === idx ? 'border-primary ring-2 ring-primary/20 shadow-sm' : 'border-border opacity-70 hover:opacity-100'}`}
                  >
                    <Image src={img} alt={`${productName} ${idx + 1}`} fill className="object-contain p-1" unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {product.categoryNames?.map((cat, i) => (
                  <Badge key={i} variant="outline" className="text-primary border-primary font-black uppercase text-[10px] tracking-widest">{cat}</Badge>
                ))}
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">{productName}</h1>
              <p className="text-xl text-muted-foreground leading-relaxed font-medium">{product.shortDescription}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-primary animate-in fade-in slide-in-from-left-2 duration-300 italic">
                  ${finalPrice.toLocaleString()}
                </span>
                <span className="text-muted-foreground font-black uppercase text-xs tracking-widest">MXN + IVA</span>
              </div>

              {/* Indicador de Disponibilidad y Entrega */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {hasImmediateStock ? (
                  <Badge className="bg-emerald-600/15 text-emerald-800 border-emerald-600/30 font-black text-xs uppercase tracking-wider py-1 px-3 shadow-xs">
                    <Zap size={13} className="mr-1.5 inline text-emerald-600" /> Entrega Inmediata ({stock} {stock === 1 ? 'disponible' : 'disponibles'})
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-800 border-amber-600/40 bg-amber-500/10 font-black text-xs uppercase tracking-wider py-1 px-3 shadow-xs">
                    <Clock size={13} className="mr-1.5 inline text-amber-600" /> Tiempo de Entrega: {deliveryTime}
                  </Badge>
                )}
              </div>

              <div className="bg-muted/50 p-3 rounded-lg border border-border flex items-center gap-3">
                <MapPin className="text-primary" size={20} />
                <p className="text-xs font-black uppercase tracking-tighter text-foreground/80 italic">
                  Precio LAB (Libre a Bordo) en planta Tecnorampa, Pedro Escobedo, Qro.
                </p>
              </div>
            </div>

            <Separator className="bg-border" />

            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black uppercase text-[10px] tracking-widest text-primary italic">
                    Configuración / Medida Certificada:
                  </h4>
                  <span className="text-[10px] text-muted-foreground font-bold">
                    {product.variants.length} medidas disponibles
                  </span>
                </div>
                <RadioGroup 
                  value={selectedVariant || ''} 
                  onValueChange={setSelectedVariant} 
                  className={cn(
                    "grid gap-2.5",
                    product.variants.length > 3 ? "grid-cols-1 sm:grid-cols-2 max-h-80 overflow-y-auto pr-1" : "grid-cols-1"
                  )}
                >
                  {product.variants.map((v) => (
                    <div key={v.id} className="relative">
                      <RadioGroupItem value={v.id} id={v.id} className="peer sr-only" />
                      <Label
                        htmlFor={v.id}
                        className="flex flex-1 items-center justify-between rounded-md border-2 border-muted bg-card p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all shadow-sm"
                      >
                        <div className="flex flex-col pr-2">
                          <span className="font-black uppercase text-xs italic">{v.name}</span>
                          <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Materia prima certificada</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-black text-sm italic text-primary">
                            ${(product.price + v.priceModifier).toLocaleString()}
                          </span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Selector de Cantidad y Aviso Dinámico de Entrega */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-black uppercase text-xs tracking-wider text-muted-foreground">
                    Cantidad:
                  </span>
                  <div className="flex items-center border-2 border-border rounded-xl bg-card overflow-hidden shadow-xs">
                    <button
                      type="button"
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="h-12 w-12 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-bold"
                      aria-label="Disminuir cantidad"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-black text-lg italic">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="h-12 w-12 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-bold"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Total Estimado:</span>
                  <span className="text-2xl font-black text-primary italic">
                    ${(finalPrice * quantity).toLocaleString()} <span className="text-xs font-normal text-muted-foreground not-italic">MXN</span>
                  </span>
                </div>
              </div>

              {/* Mensaje dinámico según stock y cantidad solicitada */}
              {hasImmediateStock && quantity <= stock && (
                <div className="bg-emerald-500/10 border-2 border-emerald-500/30 p-3.5 rounded-xl flex items-center gap-3 animate-in fade-in duration-200">
                  <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />
                  <p className="text-xs text-emerald-950 font-medium">
                    <strong className="font-black uppercase text-emerald-900">Entrega Inmediata Garantizada:</strong> Las {quantity} {quantity === 1 ? 'unidad seleccionada está en stock' : 'unidades seleccionadas están en stock'} y listas en planta.
                  </p>
                </div>
              )}

              {hasImmediateStock && quantity > stock && (
                <div className="bg-amber-500/10 border-2 border-amber-500/40 p-4 rounded-xl flex items-start gap-3 shadow-xs animate-in fade-in duration-200">
                  <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                  <div className="space-y-1 text-xs">
                    <p className="font-black uppercase tracking-wider text-amber-950">
                      Disponibilidad para {quantity} unidades:
                    </p>
                    <p className="font-medium text-amber-900 leading-relaxed">
                      Solo hay <strong>{stock} {stock === 1 ? 'unidad' : 'unidades'}</strong> en stock para <strong>entrega inmediata</strong>. Las <strong>{quantity - stock} {quantity - stock === 1 ? 'unidad restante' : 'unidades restantes'}</strong> se van a tiempo de entrega de <strong>{deliveryTime}</strong>.
                    </p>
                  </div>
                </div>
              )}

              {!hasImmediateStock && (
                <div className="bg-blue-500/10 border-2 border-blue-500/30 p-3.5 rounded-xl flex items-center gap-3 animate-in fade-in duration-200">
                  <Clock className="text-blue-600 shrink-0" size={18} />
                  <p className="text-xs text-blue-950 font-medium">
                    <strong className="font-black uppercase text-blue-900">Suministro Programado:</strong> Sin stock para entrega inmediata. Las {quantity} {quantity === 1 ? 'unidad se programará' : 'unidades se programarán'} con un tiempo de entrega de <strong>{deliveryTime}</strong>.
                  </p>
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <Button onClick={handleAddToCart} size="lg" className="flex-grow h-14 text-lg font-black uppercase italic tracking-widest shadow-xl">
                  <ShoppingCart className="mr-2 h-5 w-5" /> AGREGAR {quantity > 1 ? `(${quantity}) ` : ''}AL CARRITO
                </Button>
                <Button size="icon" variant="outline" className="h-14 w-14 shrink-0 border-2">
                  <ShieldCheck className="w-6 h-6" />
                </Button>
              </div>

              <a 
                href={(product.technicalSheetUrl || `/fichas-tecnicas/${product.slug}.pdf`) + '?v=20261102_2'}
                download={`Ficha-Tecnica-Tecnorampa-${product.slug}.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-card border-2 border-border hover:border-primary text-xs font-black uppercase tracking-wider text-muted-foreground hover:text-primary transition-all shadow-sm hover:shadow-md italic group"
              >
                <FileText size={16} className="text-primary group-hover:scale-110 transition-transform" />
                Descargar Ficha Técnica Oficial (PDF)
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              <div className="flex items-center gap-3 p-3 bg-white border border-border rounded-lg shadow-sm">
                {hasImmediateStock ? (
                  <>
                    <Zap className="text-emerald-600 shrink-0" size={20} />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Entrega Inmediata</span>
                      <span className="text-[9px] text-muted-foreground font-semibold">{stock} {stock === 1 ? 'unidad lista' : 'unidades listas'} en planta</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Clock className="text-amber-600 shrink-0" size={20} />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Tiempo de Entrega</span>
                      <span className="text-[9px] text-muted-foreground font-semibold">{deliveryTime}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border border-border rounded-lg shadow-sm">
                <ShieldCheck className="text-primary" size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Garantía Industrial 12 Meses</span>
              </div>
            </div>
            
            <div className="bg-primary/5 p-4 rounded-xl border-l-4 border-primary flex items-center gap-3">
              <MessageSquareText className="text-primary shrink-0" size={18} />
              <p className="text-[11px] font-black uppercase tracking-tight text-foreground/80 italic">
                Para solicitar factura o envío, favor de comunicarse por whatsapp al 427 276 1410
              </p>
            </div>

            {slug === 'lampara-anden-articulada' && (
              <div className="bg-amber-500/10 border-2 border-amber-500/40 p-4 rounded-xl flex items-start gap-3 shadow-xs">
                <Lightbulb className="text-amber-600 shrink-0 mt-0.5" size={20} />
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-wider text-amber-950">
                    Suministro Eléctrico: Cable de Uso Rudo Sin Clavija
                  </p>
                  <p className="text-[11px] font-medium text-amber-900 leading-relaxed">
                    Esta luminaria incluye cable de uso rudo STW 18AWG de 5 pies (1.5 m) <strong>suministrado sin clavija</strong> (puntas preparadas), ideal para conexión fija directa a la caja de control del andén o para instalar la clavija industrial requerida en sus instalaciones.
                  </p>
                </div>
              </div>
            )}

            {slug === 'poleas-industriales-cable-acero' && (
              <div className="bg-primary/10 border-2 border-primary/40 p-4 rounded-xl flex items-start gap-3 shadow-xs">
                <PackageCheck className="text-primary shrink-0 mt-0.5" size={20} />
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-wider text-foreground">
                    Suministro: Venta por Pieza Individual
                  </p>
                  <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                    Las poleas se comercializan y cotizan de forma <strong>individual por unidad</strong> según el diámetro seleccionado en la lista superior. En la fotografía se muestran dos piezas con propósitos exclusivamente ilustrativos para apreciar la variedad de tamaños y maquinados disponibles.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="specs" className="w-full">
          <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-auto p-0 mb-8 overflow-x-auto">
            <TabsTrigger 
              value="specs" 
              className="px-8 py-4 rounded-none border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black uppercase tracking-widest text-[11px] italic"
            >
              Ficha Técnica
            </TabsTrigger>
            <TabsTrigger 
              value="benefits" 
              className="px-8 py-4 rounded-none border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black uppercase tracking-widest text-[11px] italic"
            >
              Ventajas Competitivas
            </TabsTrigger>
            <TabsTrigger 
              value="operation" 
              className="px-8 py-4 rounded-none border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black uppercase tracking-widest text-[11px] italic"
            >
              Protocolo de Uso
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="specs" className="animate-in fade-in-50">
            <ProductTechnicalSheet 
              product={product} 
              currentVariantName={currentVariant?.name} 
            />
          </TabsContent>

          <TabsContent value="benefits" className="animate-in fade-in-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(product.benefits || []).map((benefit, i) => (
                <div key={i} className="flex items-start gap-4 p-5 bg-white border border-border rounded-xl shadow-sm border-t-4 border-t-primary/20">
                  <div className="mt-1 bg-primary/10 p-2 rounded-full">
                    <CheckCircle2 size={18} className="text-primary" />
                  </div>
                  <p className="font-black text-[11px] leading-relaxed uppercase tracking-tight text-foreground/80 italic">{benefit}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="operation" className="animate-in fade-in-50">
            <div className="max-w-4xl space-y-10">
              <div className="flex items-center gap-3 mb-6">
                <Lightbulb size={28} className="text-primary" />
                <h3 className="text-2xl font-black uppercase tracking-tighter italic">Secuencia de Operación Segura</h3>
              </div>
              <div className="space-y-8 relative border-l-4 border-primary/20 pl-10 ml-5">
                {(product.operationSteps || []).map((step, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[54px] top-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center font-black text-sm text-primary-foreground border-4 border-background shadow-lg" />
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Módulo {i + 1}</span>
                      <p className="text-xl font-bold leading-tight italic uppercase tracking-tighter">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
