'use client';

/**
 * Tecnorampa Pro-Store - Checkout Page
 * Blindaje v2.4 - Aislamiento estricto de Suspense para Next.js 15
 */

import { useCart } from '@/context/CartContext';
import { useUser, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, CreditCard, Truck, CheckCircle, ArrowLeft, LogIn, Lock, ClipboardCheck, MapPin, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

function CheckoutContent() {
  const { items, total, itemCount, clearCart } = useCart();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    const success = searchParams.get('success');
    const orderId = searchParams.get('order_id');

    if (success && orderId && db) {
      initialized.current = true;
      setIsSuccess(true);
      setOrderNumber(orderId);
      
      clearCart();

      const orderRef = doc(db, 'orders', orderId);
      const updateData = { 
        status: 'paid',
        paymentStatus: 'completed',
        updatedAt: serverTimestamp() 
      };

      updateDoc(orderRef, updateData).catch(() => {});
    }
  }, [clearCart, db, searchParams]);

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-40 text-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary mx-auto mb-4" />
        <p className="text-muted-foreground font-bold uppercase tracking-tight">Verificando sesión segura...</p>
      </div>
    );
  }

  if (!user && !isSuccess) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-8 border-2 border-primary/20 animate-pulse">
          <Lock size={48} />
        </div>
        <div className="text-center space-y-4 max-w-xl mb-12">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">Seguridad de Compra</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Para garantizar la validez de su garantía industrial y procesar su factura fiscal correctamente, es necesario ingresar a su cuenta corporativa.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <Card className="border-border hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <LogIn className="w-4 h-4 text-primary" /> Ya soy cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Acceda con su correo y contraseña registrados.</p>
              <Link href={`/login?redirect=/checkout`}>
                <Button className="w-full font-bold uppercase tracking-widest text-xs h-12">Iniciar Sesión</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="border-border hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-primary" /> Nuevo registro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Cree una cuenta para gestionar sus pedidos y garantías.</p>
              <Link href={`/login?redirect=/checkout&mode=signup`}>
                <Button variant="outline" className="w-full font-bold uppercase tracking-widest text-xs h-12">Registrarse</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Link href="/products" className="mt-12 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
          <ArrowLeft size={14} /> Seguir Explorando Productos
        </Link>
      </div>
    );
  }

  if (itemCount === 0 && !isSuccess) {
    return (
      <div className="container mx-auto px-4 py-20 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <Truck className="text-muted-foreground" size={32} />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Tu carrito está vacío</h2>
        <p className="text-muted-foreground mb-8">Parece que aún no has seleccionado refacciones.</p>
        <Link href="/products">
          <Button className="font-bold px-8 h-12">Ir al Catálogo</Button>
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center space-y-8">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-green-500/20 animate-in zoom-in">
          <CheckCircle size={48} />
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter uppercase italic">¡Orden Confirmada!</h1>
          <p className="text-muted-foreground text-lg">Su pedido está listo para ser programado para recolección.<br/>Enviamos los detalles a <strong className="text-foreground">{user?.email}</strong>.</p>
        </div>
        <Card className="max-w-md w-full bg-white border-border shadow-lg">
          <CardContent className="p-8 text-left space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Número de Orden:</span>
              <span className="font-black text-lg">{orderNumber || 'PROCESANDO...'}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-primary font-black">
              <span className="text-xs uppercase tracking-widest">Estado Logístico:</span>
              <span className="text-sm">Pagado - Pendiente Recolección</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Total Pagado (IVA Incl.):</span>
              <span className="font-black text-2xl text-primary">${(total * 1.16).toLocaleString()} MXN</span>
            </div>
          </CardContent>
        </Card>
        <Link href="/my-purchases">
          <Button size="lg" className="px-12 h-14 font-black uppercase tracking-widest">Ver Mis Compras</Button>
        </Link>
      </div>
    );
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    if (!db || !user) return;
    setIsProcessing(true);

    const orderData = {
      userId: user.uid,
      customerEmail: user.email,
      customerName: user.displayName || 'Cliente Corporativo',
      items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })),
      subtotal: total,
      taxes: total * 0.16,
      total: total * 1.16,
      status: 'pending', 
      paymentStatus: 'initiated',
      pickupLocation: 'Pedro Escobedo, Querétaro',
      createdAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          userEmail: user.email,
          userId: user.uid,
          orderId: docRef.id
        }),
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Error al crear sesión de Stripe');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error de Pago',
        description: error.message || 'No se pudo iniciar el proceso de Stripe.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="py-12 bg-white industrial-grid min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-4 mb-12">
          <Link href="/products" className="text-muted-foreground hover:text-primary flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">
            <ArrowLeft size={16} /> Continuar Comprando
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <div className="mb-12 flex items-center justify-between px-2 relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted z-0" />
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex flex-col items-center gap-3 relative z-10 bg-white px-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all ${step >= s ? 'bg-primary border-primary text-primary-foreground scale-110 shadow-lg' : 'bg-white border-muted text-muted-foreground'}`}>
                    {s}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {s === 1 ? 'Logística' : s === 2 ? 'Pago' : 'Revisión'}
                  </span>
                </div>
              ))}
            </div>

            <Card className="border-border shadow-xl overflow-hidden">
              <form onSubmit={handleCheckout}>
                {step === 1 && (
                  <>
                    <CardHeader className="bg-muted/30 border-b">
                      <CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tight italic">
                        <MapPin className="w-6 h-6 text-primary" />
                        Información de Recolección
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-8">
                      <div className="bg-primary/5 p-6 rounded-xl border-l-4 border-primary mb-6">
                        <h4 className="font-black uppercase text-xs tracking-widest mb-2">Punto de Entrega:</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed italic">
                          Planta Tecnorampa: Carr. Fed. México-Querétaro km 176+500, Pedro Escobedo, Qro.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Responsable de Carga</Label>
                          <Input required defaultValue={user?.displayName || ''} className="h-12 border-border focus:border-primary" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Teléfono de Contacto</Label>
                          <Input required placeholder="+52" className="h-12 border-border focus:border-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </>
                )}

                {step === 2 && (
                  <>
                    <CardHeader className="bg-muted/30 border-b">
                      <CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tight italic">
                        <CreditCard className="w-6 h-6 text-primary" />
                        Pasarela de Pago Segura
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-8">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="border-2 border-primary rounded-xl p-6 bg-primary/5 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-4">
                            <CreditCard className="text-primary w-6 h-6" />
                            <div className="flex flex-col">
                              <span className="font-black uppercase tracking-widest text-xs">Stripe Secure Checkout</span>
                              <span className="text-[10px] text-muted-foreground font-bold">Tarjeta de Crédito / Débito / Apple Pay / Google Pay</span>
                            </div>
                          </div>
                          <Badge variant="default" className="text-[9px] font-black uppercase">PCI-DSS Ready</Badge>
                        </div>
                      </div>
                      
                      <div className="p-6 bg-muted/50 rounded-xl border border-border flex items-center gap-4">
                        <ShieldCheck className="text-green-600 shrink-0" size={24} />
                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                          Será redirigido al servidor seguro de **Stripe** para completar su transacción. Los datos de su tarjeta nunca tocan nuestros servidores.
                        </p>
                      </div>
                    </CardContent>
                  </>
                )}

                {step === 3 && (
                  <>
                    <CardHeader className="bg-muted/30 border-b">
                      <CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tight italic">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                        Revisión Final
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-8">
                      <div className="bg-muted/50 p-6 rounded-xl text-sm space-y-4 border border-border">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Cliente:</span>
                          <span className="font-black">{user?.email}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Recolección:</span>
                          <span className="font-black text-primary uppercase text-right">Planta Querétaro (LAB)</span>
                        </div>
                      </div>
                    </CardContent>
                  </>
                )}

                <CardFooter className="flex justify-between border-t border-border p-8 bg-muted/10">
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="font-black uppercase tracking-widest text-xs h-12 px-8" disabled={isProcessing}>
                      Regresar
                    </Button>
                  )}
                  <Button type="submit" className="ml-auto font-black uppercase tracking-widest text-xs h-12 px-12 shadow-lg" disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="animate-spin mr-2" /> : null}
                    {step === 3 ? 'PAGAR AHORA CON STRIPE' : 'Siguiente Paso'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-4">
            <Card className="border-border sticky top-28 shadow-xl overflow-hidden border-t-4 border-t-primary">
              <CardHeader className="bg-muted/50 border-b">
                <CardTitle className="text-sm font-black uppercase tracking-[0.2em] italic">Resumen Industrial v2.4</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-8">
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={`${item.id}-${item.variant}`} className="flex justify-between text-sm">
                      <div className="flex flex-col min-w-0">
                        <span className="font-black uppercase text-[11px] truncate">{item.name}</span>
                        <span className="text-muted-foreground text-[10px] font-bold">CANT: {item.quantity}</span>
                      </div>
                      <span className="font-black text-xs">${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-muted-foreground uppercase tracking-widest">Subtotal</span>
                    <span>${total.toLocaleString()} MXN</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-muted-foreground uppercase tracking-widest">I.V.A. (16%)</span>
                    <span>${(total * 0.16).toLocaleString()} MXN</span>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between text-3xl font-black text-primary italic">
                    <span className="uppercase tracking-tighter">Total</span>
                    <span>${(total * 1.16).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
