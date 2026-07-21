'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Package, Calendar, MapPin, QrCode, ArrowLeft, Printer, ShoppingBag, Receipt, AlertCircle, MessageSquareText } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MyPurchasesPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();

  const ordersQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      where('status', '==', 'paid')
    );
  }, [db, user?.uid]);

  const { data: orders, loading: ordersLoading, error } = useCollection(ordersQuery);

  if (authLoading || ordersLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Consultando historial logístico...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="text-muted-foreground opacity-20" size={40} />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter">Acceso Requerido</h2>
        <p className="text-muted-foreground mb-8">Debes iniciar sesión para ver tus pedidos.</p>
        <Link href="/login?redirect=/my-purchases">
          <Button className="font-black uppercase tracking-widest h-12 px-8">Iniciar Sesión</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 bg-white industrial-grid min-h-screen print:bg-white print:p-0 print:py-0 print:min-h-0 print:block">
      <div className="container mx-auto px-4 max-w-5xl print:max-w-none print:px-0 print:mx-0">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 print:hidden">
          <div className="space-y-1">
            <Link href="/products" className="text-xs font-black text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 uppercase tracking-[0.2em] mb-4">
              <ArrowLeft size={14} /> Volver a Tienda
            </Link>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic border-l-8 border-primary pl-6">Mis Compras</h1>
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest ml-8">Historial de pedidos industriales confirmados</p>
          </div>
        </header>

        {error ? (
          <Card className="border-destructive bg-destructive/5 p-8 text-center print:hidden">
            <AlertCircle className="mx-auto mb-4 text-destructive" size={48} />
            <h3 className="text-lg font-black uppercase text-destructive">Error de Conexión</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              No se pudieron cargar los pedidos. Intente de nuevo más tarde.
            </p>
            <Button variant="outline" className="mt-6" onClick={() => window.location.reload()}>Reintentar</Button>
          </Card>
        ) : orders.length === 0 ? (
          <Card className="border-2 border-dashed border-border bg-muted/30 p-20 text-center print:hidden">
            <Package className="mx-auto mb-6 text-muted-foreground opacity-20" size={64} />
            <h3 className="text-2xl font-black uppercase italic mb-2">Sin pedidos pagados</h3>
            <p className="text-muted-foreground mb-8">
              Solo las compras con pago confirmado en Stripe aparecerán aquí.
            </p>
            <Link href="/products">
              <Button className="font-black h-12 px-8 uppercase tracking-widest text-xs">Ir al Catálogo</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-8 print:gap-0 print:block">
            {orders.map((order: any) => (
              <Card key={order.id} className="border-border shadow-xl overflow-hidden hover:border-primary/50 transition-colors print:shadow-none print:border-2 print:border-black print:mb-0 print:rounded-none print:break-inside-avoid print:page-break-after-always last:print:page-break-after-auto">
                <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between py-4 print:bg-gray-100 print:border-b-2 print:border-black">
                  <div className="flex items-center gap-4">
                    <Badge className="bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest print:border-black print:text-black print:bg-transparent">
                      PAGADO
                    </Badge>
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest print:text-black">
                      ORDEN: #{order.id.substring(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground print:text-black">
                    <Calendar size={14} />
                    <span className="text-[10px] font-bold uppercase">
                      {order.createdAt ? format(order.createdAt.toDate(), "d 'de' MMMM, yyyy", { locale: es }) : 'Reciente'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 lg:grid-cols-3 gap-8 print:grid-cols-3 print:gap-4 print:pt-4">
                  <div className="lg:col-span-2 space-y-4 print:col-span-2">
                    <h4 className="font-black uppercase text-xs tracking-widest italic text-primary flex items-center gap-2 print:text-black">
                      <Receipt size={16} /> Detalles del Pedido
                    </h4>
                    <div className="space-y-2">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-muted/50 rounded-lg border border-border print:bg-transparent print:border-gray-200">
                          <div className="flex flex-col">
                            <span className="font-black text-xs uppercase italic">{item.name}</span>
                            <span className="text-[9px] text-muted-foreground font-bold print:text-gray-600">CANTIDAD: {item.quantity}</span>
                          </div>
                          <span className="font-black text-xs">${(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center bg-primary/5 p-3 rounded-xl border border-primary/20 print:bg-transparent print:border-black">
                      <span className="font-black uppercase text-[10px] italic tracking-widest">Total Pagado (IVA Incl.):</span>
                      <span className="text-xl font-black text-primary print:text-black">${order.total.toLocaleString()} MXN</span>
                    </div>
                  </div>

                  <div className="bg-foreground text-background rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl print:bg-white print:text-black print:border-2 print:border-black print:shadow-none print:rounded-lg">
                    <div className="p-2 bg-white rounded-lg shadow-lg print:shadow-none print:border">
                      <QrCode size={100} className="text-foreground" />
                    </div>
                    <div className="space-y-0.5">
                      <h5 className="font-black uppercase tracking-widest text-[9px] italic text-primary print:text-black">Código de Recolección</h5>
                      <p className="text-xl font-black tracking-[0.2em] font-mono">{order.id.substring(0, 8).toUpperCase()}</p>
                    </div>
                    <Separator className="bg-white/10 print:bg-gray-200" />
                    <div className="flex items-start gap-2 text-left">
                      <MapPin size={14} className="text-primary shrink-0 mt-0.5 print:text-black" />
                      <p className="text-[8px] font-medium leading-tight uppercase tracking-tight opacity-70 print:opacity-100">
                        Planta Tecnorampa: Carr. Fed. México-Querétaro km 176+500, Pedro Escobedo, Qro.
                      </p>
                    </div>
                    <Button 
                      variant="secondary" 
                      className="w-full bg-white text-foreground hover:bg-white/90 font-black uppercase text-[9px] tracking-widest h-10 print:hidden"
                      onClick={() => window.print()}
                    >
                      <Printer className="mr-2 h-4 w-4" /> Imprimir Recibo
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/10 border-t py-3 px-6 print:bg-transparent flex flex-col gap-2 items-start">
                  <div className="flex items-center gap-2">
                    <MessageSquareText size={14} className="text-primary print:text-black" />
                    <p className="text-[10px] font-black uppercase tracking-tight text-foreground/80 italic print:text-black">
                      Para solicitar factura o envío, favor de comunicarse por whatsapp al 427 276 1410
                    </p>
                  </div>
                  <p className="text-[8px] text-muted-foreground font-medium italic print:text-black">
                    * Comprobante oficial de pago. Factura disponible al momento de la recolección física.
                  </p>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
