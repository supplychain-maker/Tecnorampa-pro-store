'use client';

import { useMemo, useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, where, doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Loader2, 
  Package, 
  Mail, 
  User as UserIcon, 
  ArrowLeft, 
  Factory, 
  Search,
  Camera,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

function SalesContent() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const orderParam = searchParams.get('order');
  
  const [searchTerm, setSearchTerm] = useState(orderParam || '');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [deliveryPhoto, setDeliveryPhoto] = useState<string | null>(null);
  const [isDelivering, setIsDelivering] = useState(false);

  const userDocRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile, loading: profileLoading } = useDoc(userDocRef);
  const isAdmin = profile?.role === 'admin';

  const salesQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'orders'),
      where('status', '==', 'paid')
    );
  }, [db]);

  const { data: sales, loading: salesLoading } = useCollection(salesQuery);

  // Si se pasa ?order=... por URL (desde escaneo de QR), autoseleccionar y abrir
  useEffect(() => {
    if (!orderParam || !db) return;

    if (sales && sales.length > 0) {
      const match = sales.find((o: any) => 
        o.id === orderParam || o.id.toLowerCase().startsWith(orderParam.toLowerCase())
      );
      if (match) {
        setSelectedOrder(match);
        return;
      }
    }

    const orderDocRef = doc(db, 'orders', orderParam);
    getDoc(orderDocRef).then((snap) => {
      if (snap.exists()) {
        setSelectedOrder({ id: snap.id, ...snap.data() });
      }
    }).catch(console.error);
  }, [orderParam, sales, db]);

  const filteredSales = useMemo(() => {
    if (!searchTerm.trim()) return sales || [];
    return (sales || []).filter((order: any) => 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [sales, searchTerm]);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1500000) {
        toast({ 
          variant: "destructive", 
          title: "Imagen muy pesada", 
          description: "Por favor usa una foto de menor resolución." 
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setDeliveryPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmDelivery = async () => {
    if (!db || !selectedOrder || !deliveryPhoto) return;
    setIsDelivering(true);

    const orderRef = doc(db, 'orders', selectedOrder.id);
    const updateData = {
      status: 'delivered',
      deliveryPhoto,
      deliveredAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      await updateDoc(orderRef, updateData);
      toast({ title: "Entrega Registrada", description: "El pedido ha sido marcado como entregado con éxito." });
      setSelectedOrder(null);
      setDeliveryPhoto(null);
    } catch (error: any) {
      console.error("Error actualizando pedido:", error);
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: orderRef.path,
        operation: 'update',
        requestResourceData: updateData
      }));
    } finally {
      setIsDelivering(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!user || !isAdmin) {
    const redirectUrl = orderParam ? `/admin/sales?order=${encodeURIComponent(orderParam)}` : '/admin/sales';
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 border-2 border-primary/20 animate-pulse">
          <Lock size={40} />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Acceso de Administrador</h2>
        <p className="text-muted-foreground text-xs leading-relaxed mb-6">
          Inicia sesión con tu cuenta de <strong>Administrador de Tecnorampa</strong> para consultar las ventas y entregas.
        </p>
        <Link href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}>
          <Button className="font-black uppercase tracking-widest text-xs h-12 px-8">
            Iniciar Sesión como Administrador →
          </Button>
        </Link>
        <Link href="/" className="mt-4 text-[10px] uppercase font-bold text-muted-foreground hover:underline">
          Volver a la Tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 industrial-grid min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div className="space-y-1">
            <Link href="/admin/products" className="text-xs font-black text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 uppercase tracking-[0.2em] mb-4">
              <ArrowLeft size={14} /> Gestión de Catálogo
            </Link>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic border-l-8 border-primary pl-6">
              Ventas a Entregar
            </h1>
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest ml-8">
              Control de pedidos pagados y autorizados para recolección
            </p>
          </div>
          <Link href="/admin/deliveries">
            <Button variant="outline" className="font-black uppercase text-xs tracking-widest h-12">
              Ver Gestión de Entregas e Historial →
            </Button>
          </Link>
        </div>

        {/* Buscador */}
        <div className="mb-8 max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 text-muted-foreground" size={20} />
            <Input 
              placeholder="Buscar por ID, folio o cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 bg-white border-2 border-border focus:border-primary font-bold shadow-sm"
            />
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl shadow-xl overflow-hidden">
          {salesLoading ? (
            <div className="p-16 text-center">
              <Loader2 className="animate-spin text-primary mx-auto mb-4" size={40} />
              <p className="text-muted-foreground font-black uppercase text-xs tracking-widest">Cargando ventas...</p>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <Package size={48} className="text-muted-foreground mx-auto opacity-30" />
              <h3 className="text-xl font-black uppercase italic">No se encontraron pedidos</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">Prueba con otro ID o asegúrate de que el pago esté confirmado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">ID Pedido / Fecha</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Cliente / Contacto</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Equipos Solicitados</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Total Cobrado</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((order: any) => (
                  <TableRow key={order.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-black text-sm uppercase italic tracking-tighter text-primary">#{order.id.substring(0, 8).toUpperCase()}</span>
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {order.createdAt ? format(order.createdAt.toDate(), "dd/MM/yyyy HH:mm", { locale: es }) : 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2">
                          <UserIcon size={12} className="text-muted-foreground" />
                          <span className="font-bold text-sm">{order.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={12} className="text-primary" />
                          <a href={`mailto:${order.customerEmail}`} className="text-[10px] font-medium hover:underline text-muted-foreground">
                            {order.customerEmail}
                          </a>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-5 font-black bg-muted">x{item.quantity}</Badge>
                            <span className="text-xs font-bold truncate max-w-[200px]">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-black text-sm">${order.total?.toLocaleString()} MXN</span>
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">✓ PAGO CONFIRMADO</span>
                        {order.notificationSent && (
                          <span className="text-[9px] font-bold text-muted-foreground flex items-center gap-1 mt-0.5" title={`Notificado vía ${order.notificationMethod || 'email'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                            Notificado: {order.notificationSentTo || 'supplychain'}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        onClick={() => setSelectedOrder(order)}
                        className="font-black uppercase text-[10px] tracking-widest h-10 italic"
                      >
                        ENTREGAR EQUIPO
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Modal de Validación y Entrega */}
      <Dialog open={!!selectedOrder} onOpenChange={() => { setSelectedOrder(null); setDeliveryPhoto(null); }}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto border-t-8 border-t-primary p-6">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between gap-2 mb-1">
              <Badge className="bg-emerald-600 text-white font-black uppercase text-xs tracking-wider">
                ✓ COMPRA APROBADA - PAGO STRIPE OK
              </Badge>
              <span className="font-mono text-xs font-black text-muted-foreground">
                FOLIO: #{selectedOrder?.id?.substring(0, 8).toUpperCase()}
              </span>
            </div>
            <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
              Detalle de Venta y Recolección
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              ID en Sistema: <span className="font-mono text-[11px] text-foreground font-bold">{selectedOrder?.id}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3">
              <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={24} />
              <div className="space-y-0.5">
                <div className="text-xs font-black uppercase text-emerald-800 tracking-wider">
                  Pago Aprobado y Verificado
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Este pedido fue pagado a través de <strong>Stripe</strong>. Mercancía autorizada para entrega en planta.
                </p>
              </div>
            </div>

            {/* Datos del Cliente */}
            <div className="bg-muted/60 p-4 rounded-xl border border-border space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Datos del Comprador
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-muted-foreground">Nombre:</span>
                <span className="font-black text-sm">{selectedOrder?.customerName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-muted-foreground">Correo:</span>
                <a href={`mailto:${selectedOrder?.customerEmail}`} className="font-bold text-primary hover:underline">
                  {selectedOrder?.customerEmail}
                </a>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-muted-foreground">Fecha de Pago:</span>
                <span className="font-bold">
                  {selectedOrder?.createdAt ? format(selectedOrder.createdAt.toDate(), "dd/MM/yyyy HH:mm 'hrs'", { locale: es }) : 'Reciente'}
                </span>
              </div>
            </div>

            {/* Productos Comprados */}
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Equipos y Refacciones a Entregar:
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {selectedOrder?.items?.map((item: any, idx: number) => {
                  const itemTotal = Number(item.price || 0) * Number(item.quantity || 1);
                  return (
                    <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-lg border border-border shadow-sm">
                      <div className="flex flex-col">
                        <span className="font-black text-xs uppercase italic">{item.name}</span>
                        {item.variant && (
                          <span className="text-[11px] text-muted-foreground font-semibold">Especificación: {item.variant}</span>
                        )}
                        <span className="text-[10px] font-black text-primary mt-0.5">CANTIDAD: x{item.quantity}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sm">${itemTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                        <div className="text-[10px] text-muted-foreground">${Number(item.price).toLocaleString()} c/u</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total Pagado */}
            <div className="bg-muted p-4 rounded-xl border border-border flex justify-between items-center">
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Total Pagado:</div>
                <div className="text-[10px] text-muted-foreground">IVA (16%) incluido</div>
              </div>
              <span className="text-2xl font-black text-emerald-600">
                ${selectedOrder?.total?.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </span>
            </div>

            {/* Subir foto de evidencia */}
            <div className="space-y-3 pt-2 border-t">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={16} />
                <p className="text-[10px] font-bold uppercase text-amber-900 leading-relaxed">
                  Requisito de Entrega: Sube una foto del equipo cargado en el vehículo del cliente o entregado en el andén como evidencia oficial.
                </p>
              </div>

              <div className="relative aspect-video bg-muted border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center overflow-hidden">
                {deliveryPhoto ? (
                  <>
                    <Image src={deliveryPhoto} alt="Evidencia" fill className="object-cover" />
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="absolute bottom-2 right-2 text-[10px] h-8 font-black uppercase"
                      onClick={() => setDeliveryPhoto(null)}
                    >
                      ELIMINAR Y REPETIR
                    </Button>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2 p-6 text-center w-full h-full justify-center hover:bg-muted/80 transition-colors">
                    <Camera size={44} className="text-primary opacity-60" />
                    <span className="text-xs font-black uppercase tracking-widest text-primary">TOMAR FOTO CON EL CELULAR</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">Toca aquí para abrir la cámara o seleccionar archivo</span>
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoCapture} />
                  </label>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t">
            <Button variant="outline" className="font-bold uppercase text-[10px]" onClick={() => setSelectedOrder(null)}>CANCELAR</Button>
            <Button 
              className="font-black uppercase text-[10px] tracking-widest italic bg-emerald-600 hover:bg-emerald-700 text-white h-11" 
              disabled={!deliveryPhoto || isDelivering}
              onClick={confirmDelivery}
            >
              {isDelivering ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              CONFIRMAR Y ENTREGAR EQUIPO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminSalesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    }>
      <SalesContent />
    </Suspense>
  );
}
