"use client"

import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { X, Plus, Minus, ShoppingBag, ArrowRight, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SheetClose, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { getDirectImageUrl } from '@/lib/utils';

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
              <div className="relative w-20 h-20 bg-white border border-border rounded overflow-hidden flex-shrink-0 p-1">
                <Image 
                  src={getDirectImageUrl(item.image)} 
                  alt={item.name} 
                  fill 
                  className="object-contain" 
                  unoptimized
                />
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-black uppercase text-[11px] italic truncate pr-2 tracking-tighter">{item.name}</h4>
                  <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <X size={16} />
                  </button>
                </div>
                {item.variant && <p className="text-[9px] font-bold text-muted-foreground mb-2 uppercase tracking-widest">Config: {item.variant}</p>}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 border border-border rounded-md px-2 py-1 bg-muted/50">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="text-muted-foreground hover:text-foreground p-0.5 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="text-muted-foreground hover:text-foreground p-0.5 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="text-sm font-black text-primary italic">
                    ${(item.price * item.quantity).toLocaleString()}
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
          <p className="text-[9px] leading-tight font-black uppercase text-foreground/70 tracking-tight italic">
            Nota: Recolección en Planta Querétaro (LAB).
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-muted-foreground uppercase tracking-widest">Subtotal</span>
            <span className="font-black">${total.toLocaleString()} MXN</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-xl font-black italic text-primary">
            <span className="uppercase tracking-tighter">Total</span>
            <span>${total.toLocaleString()} MXN</span>
          </div>
        </div>
        
        <Link href="/checkout" className="block w-full">
          <SheetClose asChild>
            <Button className="w-full h-14 text-md font-black uppercase italic tracking-widest shadow-xl group">
              PROCESAR PAGO SEGURO
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </SheetClose>
        </Link>
        <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-[0.2em]">
          PRECIOS INCLUYEN IVA
        </p>
      </div>
    </div>
  );
}
