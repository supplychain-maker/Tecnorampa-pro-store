import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/app/lib/products';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingCart, MapPin, FileText, Layers } from 'lucide-react';
import { getDirectImageUrl } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

const PRODUCT_IMAGE_COUNTS: Record<string, number> = {
  'tope-anden-acero': 4,
  'tope-anden-laminado': 5,
  'lampara-anden-articulada': 4,
  'semaforo-led-industrial': 3,
  'niveladora-hidraulica-premium': 3,
  'niveladora-mecanica-industrial': 3,
  'rampa-parking-evolution': 3,
  'rampa-parking-lift': 3,
  'mini-dock-hidraulico': 3,
  'mini-dock-mecanico': 3,
  'mecanismo-freno-rampa-auto-release': 2,
  'resorte-extension-niveladora': 2,
  'poleas-guia-cable-traccion': 3,
  'valvula-solenoide-parker': 3,
  'botonera-colgante-banana': 3,
  'boton-paro-emergencia-giro': 2,
  'boton-paro-emergencia-llave': 3,
  'caja-din-mando-bipolar': 2,
  'balero-contacto-angular-5205': 2,
  'balero-rigido-bolas-6005': 2,
  'rodamiento-rodillos-ncf2208': 3,
};

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const displayImage = getDirectImageUrl(product.image);
  const totalImagesCount = PRODUCT_IMAGE_COUNTS[product.slug] || product.images?.length || 1;

  const hasTechnicalSheet = !!product.technicalSheetUrl || 
    product.slug === 'tope-anden-acero' || 
    product.slug === 'tope-anden-laminado';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: product.id || product.slug,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });

    toast({
      title: "Agregado al carrito",
      description: `${product.name} se ha añadido correctamente.`,
    });
  };

  const handleCardClick = () => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/') {
        sessionStorage.setItem('home_scroll_pos', window.scrollY.toString());
      } else if (window.location.pathname.startsWith('/products')) {
        sessionStorage.setItem('products_scroll_pos', window.scrollY.toString());
      }
    }
  };

  return (
    <Card className="overflow-hidden border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-all duration-300 h-full flex flex-col shadow-sm hover:shadow-md group">
      {/* Área clickable de imagen y título */}
      <Link href={`/products/${product.slug}`} onClick={handleCardClick} className="flex-grow">
        <div className="relative aspect-[4/3] overflow-hidden bg-white p-4">
          <Image 
            src={displayImage} 
            alt={product.name} 
            fill 
            className="object-contain transition-transform duration-500 group-hover:scale-105 p-2"
            data-ai-hint="industrial product photo"
            unoptimized
          />
          <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 max-w-[90%] pointer-events-none">
            {product.mainGroupName && (
              <Badge className="font-black uppercase text-[9px] tracking-widest shadow-sm bg-primary text-primary-foreground border-none">
                {product.mainGroupName}
              </Badge>
            )}
            {product.subGroup && (
              <Badge className="font-black uppercase text-[9px] tracking-widest shadow-sm bg-neutral-900/85 text-white backdrop-blur-sm border border-neutral-700/50">
                {product.subGroup}
              </Badge>
            )}
            {!product.mainGroupName && !product.subGroup && product.categoryNames?.slice(0, 1).map((cat, i) => (
              <Badge key={i} className="font-black uppercase text-[9px] tracking-widest shadow-sm" variant="secondary">
                {cat}
              </Badge>
            ))}
          </div>

          {hasTechnicalSheet && (
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md text-[9px] font-black uppercase text-foreground/85 border border-primary/40 shadow-xs tracking-wider">
              <FileText size={11} className="text-primary" />
              <span>Ficha Técnica</span>
            </div>
          )}

          {totalImagesCount > 1 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-neutral-950/80 text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md backdrop-blur-xs border border-white/20 shadow-xs pointer-events-none">
              <Layers size={11} className="text-primary" />
              <span>{totalImagesCount} {product.slug.includes('tope') || product.slug.includes('lampara') || product.slug.includes('semaforo') ? 'Vistas y Planos' : 'Ángulos'}</span>
            </div>
          )}
        </div>
        
        <CardContent className="p-6">
          <h3 className="text-xl font-black mb-2 group-hover:text-primary transition-colors uppercase italic tracking-tighter leading-tight">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 font-medium">
            {product.shortDescription}
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-black text-2xl italic">
              ${product.price.toLocaleString()} 
              <span className="text-xs text-muted-foreground font-normal not-italic tracking-widest">MXN</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
              <MapPin size={12} className="text-primary" />
              Recolección en Planta
            </div>
          </div>
        </CardContent>
      </Link>

      {/* Botones de acción */}
      <CardFooter className="p-6 pt-0 flex flex-col gap-2">
        <Button className="w-full group/btn h-11 font-bold uppercase tracking-widest text-[10px]" variant="outline" asChild>
          <Link href={`/products/${product.slug}`}>
            Ver Especificaciones
            <ArrowRight className="ml-2 w-3 h-3 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </Button>
        <Button 
          onClick={handleAddToCart}
          className="w-full h-11 font-black uppercase tracking-widest text-[10px] italic shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Agregar al Carrito
        </Button>
      </CardFooter>
    </Card>
  );
}
