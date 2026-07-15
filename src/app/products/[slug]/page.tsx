
"use client"

import { use, useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, ShoppingCart, ShieldCheck, Lightbulb, PackageCheck, MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Product } from '@/app/lib/products';
import { getDirectImageUrl } from '@/lib/utils';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const db = useFirestore();
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const productQuery = useMemo(() => {
    if (!db || !slug) return null;
    return query(collection(db, 'products'), where('slug', '==', slug), limit(1));
  }, [db, slug]);

  const { data: products, loading } = useCollection<Product>(productQuery);
  const product = products?.[0];

  // Establecer la variante inicial una vez que el producto se carga
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

  const currentVariant = product.variants?.find(v => v.id === selectedVariant);
  const finalPrice = product.price + (currentVariant?.priceModifier || 0);

  const imagesToDisplay = (product.images && product.images.length > 0) 
    ? product.images.map(img => getDirectImageUrl(img))
    : [getDirectImageUrl(product.image)];

  const handleAddToCart = () => {
    addItem({
      id: product.id || product.slug,
      name: product.name,
      price: finalPrice,
      quantity: 1,
      image: product.image,
      variant: currentVariant ? currentVariant.name : undefined
    });

    toast({
      title: "Agregado al carrito",
      description: `${product.name}${currentVariant ? ` (${currentVariant.name})` : ''} se ha añadido correctamente.`,
    });
  };

  return (
    <div className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-xl overflow-hidden border border-border group p-8">
              <Image 
                src={imagesToDisplay[activeImage]} 
                alt={product.name} 
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
            <div className="grid grid-cols-4 gap-4">
              {imagesToDisplay.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(idx)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all bg-white p-2 ${activeImage === idx ? 'border-primary' : 'border-border opacity-60 hover:opacity-100'}`}
                >
                  <Image src={img} alt={`${product.name} ${idx}`} fill className="object-contain p-1" unoptimized />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {product.categoryNames?.map((cat, i) => (
                  <Badge key={i} variant="outline" className="text-primary border-primary font-black uppercase text-[10px] tracking-widest">{cat}</Badge>
                ))}
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">{product.name}</h1>
              <p className="text-xl text-muted-foreground leading-relaxed font-medium">{product.shortDescription}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-primary animate-in fade-in slide-in-from-left-2 duration-300 italic">
                  ${finalPrice.toLocaleString()}
                </span>
                <span className="text-muted-foreground font-black uppercase text-xs tracking-widest">MXN + IVA</span>
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
                <h4 className="font-black uppercase text-[10px] tracking-widest text-primary italic">Configuración Técnica Certificada:</h4>
                <RadioGroup 
                  value={selectedVariant || ''} 
                  onValueChange={setSelectedVariant} 
                  className="grid grid-cols-1 gap-3"
                >
                  {product.variants.map((v) => (
                    <div key={v.id} className="relative">
                      <RadioGroupItem value={v.id} id={v.id} className="peer sr-only" />
                      <Label
                        htmlFor={v.id}
                        className="flex flex-1 items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all shadow-sm"
                      >
                        <div className="flex flex-col">
                          <span className="font-black uppercase text-xs italic">{v.name}</span>
                          <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Ajuste de ingeniería directa</span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-sm italic">
                            ${(product.price + v.priceModifier).toLocaleString()}
                          </span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button onClick={handleAddToCart} size="lg" className="flex-grow h-14 text-lg font-black uppercase italic tracking-widest shadow-xl">
                <ShoppingCart className="mr-2 h-5 w-5" /> AGREGAR AL CARRITO
              </Button>
              <Button size="icon" variant="outline" className="h-14 w-14 shrink-0 border-2">
                <ShieldCheck className="w-6 h-6" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              <div className="flex items-center gap-3 p-3 bg-white border border-border rounded-lg shadow-sm">
                <PackageCheck className="text-primary" size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Disponibilidad Inmediata</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border border-border rounded-lg shadow-sm">
                <ShieldCheck className="text-primary" size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Garantía Industrial 12 Meses</span>
              </div>
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4 max-w-5xl">
              {Object.entries(product.specs || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-4 border-b border-border">
                  <span className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">{key}</span>
                  <span className="font-bold text-sm">{String(value)}</span>
                </div>
              ))}
              {currentVariant && (
                <div className="flex justify-between items-center py-4 border-b-2 border-primary bg-primary/5 px-4 rounded-t-lg">
                  <span className="text-primary font-black uppercase text-[10px] tracking-widest">Variante Seleccionada</span>
                  <span className="font-black text-sm text-primary uppercase italic">{currentVariant.name}</span>
                </div>
              )}
            </div>
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
