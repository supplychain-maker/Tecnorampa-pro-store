import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/app/lib/products';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingCart, MapPin } from 'lucide-react';
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

  return (
    <Card className="overflow-hidden border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-all duration-300 h-full flex flex-col shadow-sm hover:shadow-md group">
      {/* Área clickable de imagen y título */}
      <Link href={`/products/${product.slug}`} className="flex-grow">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image 
            src={displayImage} 
            alt={product.name} 
            fill 
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            data-ai-hint="industrial product photo"
            unoptimized
          />
          <div className="absolute top-4 left-4 flex flex-wrap gap-1">
            {product.categoryNames?.slice(0, 1).map((cat, i) => (
              <Badge key={i} className="font-bold" variant="secondary">
                {cat}
              </Badge>
            ))}
          </div>
        </div>
        
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors uppercase italic tracking-tighter">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {product.shortDescription}
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-black text-2xl italic">
              ${product.price.toLocaleString()} 
              <span className="text-xs text-muted-foreground font-normal not-italic">MXN</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-muted-foreground tracking-wider">
              <MapPin size={12} className="text-primary" />
              Recolección en Planta
            </div>
          </div>
        </CardContent>
      </Link>

      {/* Botones de acción */}
      <CardFooter className="p-6 pt-0 flex flex-col gap-2">
        <Button className="w-full group/btn h-11 font-bold uppercase tracking-tight" variant="outline" asChild>
          <Link href={`/products/${product.slug}`}>
            Ver Detalles
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </Button>
        <Button 
          onClick={handleAddToCart}
          className="w-full h-11 font-black uppercase tracking-widest text-[11px] italic shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Agregar al Carrito
        </Button>
      </CardFooter>
    </Card>
  );
}
