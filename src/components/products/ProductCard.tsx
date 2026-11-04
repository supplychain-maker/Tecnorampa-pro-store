import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/app/lib/products';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingCart, MapPin, Zap, Clock } from 'lucide-react';
import { getDirectImageUrl } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const displayImage = getDirectImageUrl(product.image);
  const displayName = product.slug === 'resorte-extension-amarillo-rampa'
    ? 'Resorte de Extensión Amarillo'
    : product.name;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: product.id || product.slug,
      name: displayName,
      price: product.price,
      quantity: 1,
      image: product.image,
      stock: product.stock,
      deliveryTime: product.deliveryTime
    });

    toast({
      title: "Agregado al carrito",
      description: `${displayName} se ha añadido correctamente.`,
    });
  };

  const handleCardClick = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('navigated_to_product', 'true');
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
            alt={displayName} 
            fill 
            className="object-contain transition-transform duration-500 group-hover:scale-105 p-2"
            data-ai-hint="industrial product photo"
            unoptimized
          />
        </div>
        
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-2.5">
            {(product.stock ?? 0) > 0 ? (
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                <Zap size={10} className="text-emerald-600" /> Entrega Inmediata ({product.stock})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded">
                <Clock size={10} className="text-primary" /> Entrega: {product.deliveryTime || '3 a 5 días'}
              </span>
            )}
          </div>
          <h3 className="text-xl font-black mb-2 group-hover:text-primary transition-colors uppercase italic tracking-tighter leading-tight">
            {displayName}
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
          <Link href={`/products/${product.slug}`} onClick={handleCardClick}>
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
