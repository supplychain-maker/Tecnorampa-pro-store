"use client"

import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { X, Plus, Minus, ShoppingBag, ArrowRight, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SheetClose, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

export function CartDrawer() {
  const { items, total, updateQuantity, removeItem, itemCount } = useCart();

  if (itemCount === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
        <SheetHeader className="sr-only">
          <SheetTitle>Carrito Vacío</SheetTitle>
          <SheetDescription>No hay productos en tu carrito actualmente.</SheetDescription>
        </SheetHeader>
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <ShoppingBag className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Carrito Vacío</h3>
          <p className="text-sm text-muted-foreground">Aún no has agregado refacciones a tu orden.</p>
        </div>
        <SheetClose asChild>
          <Button variant="outline" className="w-full">Explorar Productos</Button>
        </SheetClose>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card">
      <SheetHeader className="p-6 border-b border-border space-y-1">
        <SheetTitle className="text-xl font-bold flex items-center gap-2">
          Tu Pedido <span className="text-sm font-normal text-muted-foreground">({itemCount} items)</span>
        </SheetTitle>
        <SheetDescription className="text-xs text-muted-foreground">
          Revisa los productos seleccionados antes de finalizar tu compra.
        </SheetDescription>
      </SheetHeader>

      <ScrollArea className="flex-grow p-6">
        <div className="space-y-6">
          {items.map((item) => (
            <div key={`${item.id}-${item.variant}`} className="flex gap-4">
              <div className="relative w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                <Image 
                  src={item.image} 
                  alt={item.name} 
                  fill 
                  className="object-cover" 
                  data-ai-hint="industrial spare part"
                />
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm truncate pr-2">{item.name}</h4>
                  <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <X size={16} />
                  </button>
                </div>
                {item.variant && <p className="text-xs text-muted-foreground mb-2">Opción: {item.variant}</p>}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 border border-border rounded-md px-2 py-1">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    ${(item.price * item.quantity).toLocaleString()} MXN
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-6 border-t border-border space-y-4 bg-muted/30">
        <div className="bg-primary/10 p-3 rounded-lg border border-primary/20 flex items-start gap-2 mb-2">
          <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
          <p className="text-[10px] leading-tight font-black uppercase text-foreground/70 tracking-tight">
            Nota: Todos los equipos se entregan para recolección en nuestras instalaciones de Pedro Escobedo, Querétaro.
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-medium">Subtotal</span>
            <span className="font-bold">${total.toLocaleString()} MXN</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-medium">Envío / Flete</span>
            <span className="text-primary font-black uppercase text-[10px] tracking-wider">Por cuenta del cliente</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total Estimado</span>
            <span className="text-primary">${total.toLocaleString()} MXN</span>
          </div>
        </div>
        
        <Link href="/checkout" className="block w-full">
          <SheetClose asChild>
            <Button className="w-full h-12 text-md font-bold group">
              Finalizar Compra
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </SheetClose>
        </Link>
        <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-widest">
          Precios incluyen IVA • Facturación disponible
        </p>
      </div>
    </div>
  );
}
