'use client';

import { useMemo, useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, where, doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  PackageCheck,
  Mail, 
  User as UserIcon, 
  ArrowLeft, 
  Factory, 
  Search,
  Camera,
  CheckCircle2,
  AlertCircle,
  History,
  ClipboardList,
  Calendar,
  CreditCard,
  Lock,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

function DeliveriesContent() {
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

  const pendingQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'orders'),
      where('status', '==', 'paid')
    );
  }, [db]);

  const historyQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'orders'),
      where('status', '==', 'delivered')
    );
  }, [db]);

  const { data: pendingSales } = useCollection(pendingQuery);
  const { data: historySales } = useCollection(historyQuery);

  // Si se escanea el código QR (?order=...), auto-seleccionar y abrir la orden en pantalla
  useEffect(() => {
    if (!orderParam || !db) return;

    // 1. Buscar en pedidos pendientes
    if (pendingSales && pendingSales.length > 0) {
      const match = pendingSales.find((o: any) => 
        o.id === orderParam || o.id.toLowerCase().startsWith(orderParam.toLowerCase())
      );
      if (match) {
        setSelectedOrder(match);
        return;
      }
    }

    // 2. Buscar en pedidos entregados
    if (historySales && historySales.length > 0) {
      const match = historySales.find((o: any) => 
        o.id === orderParam || o.id.toLowerCase().startsWith(orderParam.toLowerCase())
      );
      if (match) {
        setSelectedOrder(match);
        return;
      }
    }

    // 3. Consulta directa a Firestore por ID si no está en la vista inicial
    const orderDocRef = doc(db, 'orders', orderParam);
    getDoc(orderDocRef).then((snap) => {
      if (snap.exists()) {
        setSelectedOrder({ id: snap.id, ...snap.data() });
      }
    }).catch(console.error);
  }, [orderParam, pendingSales, historySales, db]);

  const filteredPending = useMemo(() => {
    if (!searchTerm.trim()) return pendingSales || [];
    return (pendingSales || []).filter((order: any) => 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [pendingSales, searchTerm]);

  const filteredHistory = useMemo(() => {
    if (!searchTerm.trim()) return historySales || [];
    return (historySales || []).filter((order: any) => 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [historySales, searchTerm]);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1500000) {
        toast({ 
          variant: "destructive", 
          title: "Imagen muy pesada", 
          description: "Por favor usa una foto de menor resolución para el registro." 
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
      deliveryPhoto: deliveryPhoto,
      deliveredAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      await updateDoc(orderRef, updateData);
      toast({ title: "¡Entrega Registrada!", description: `Pedido #${selectedOrder.id.substring(0, 8).toUpperCase()} entregado con éxito.` });
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

  // Si no ha iniciado sesión o no es administrador
  if (!user || !isAdmin) {
    const redirectUrl = orderParam ? `/admin/deliveries?order=${encodeURIComponent(orderParam)}` : '/admin/deliveries';
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 border-2 border-primary/20 animate-pulse">
          <Lock size={40} />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Validación de Entrega Oficial</h2>
        <p className="text-muted-foreground text-xs leading-relaxed mb-6">
          Para escanear códigos QR de recolección y consultar los detalles de la compra autorizada, debes iniciar sesión con una cuenta de <strong>Administrador de Tecnorampa</strong>.
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
              Validación y Entrega de Pedidos
            </h1>
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest ml-8">
              Escaneo de vales QR, verificación de pagos y evidencia de entrega
            </p>
          </div>
        </div>

        {/* Buscador de pedidos */}
        <div className="mb-8 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 text-muted-foreground" size={20} />
            <Input 
              placeholder="Buscar por ID de pedido, folio (#...) o nombre del cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 bg-white border-2 border-border focus:border-primary font-bold shadow-sm"
            />
          </div>
        </div>

        <Tabs defaultValue="pending" className="space-y-8">
          <TabsList className="bg-muted/50 p-1 h-14 border border-border">
            <TabsTrigger value="pending" className="font-black uppercase text-xs tracking-widest px-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ClipboardList className="mr-2 h-4 w-4" /> Por Entregar ({filteredPending.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="font-black uppercase text-xs tracking-widest px-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <History className="mr-2 h-4 w-4" /> Historial Entregados ({filteredHistory.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Pedidos por entregar */}
          <TabsContent value="pending">
            <div className="bg-white border border-border rounded-xl shadow-xl overflow-hidden">
              {filteredPending.length === 0 ? (
                <div className="p-16 text-center space-y-4">
                  <PackageCheck size={48} className="text-muted-foreground mx-auto opacity-30" />
                  <h3 className="text-xl font-black uppercase italic">No hay pedidos pendientes de entrega</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto">Todos los pedidos pagados han sido entregados.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Folio / Fecha</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Cliente / Contacto</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Equipos a Entregar</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Total Pagado</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPending.map((order: any) => (
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
                            <span className="font-bold text-sm">{order.customerName}</span>
                            <span className="text-[10px] font-medium text-muted-foreground">{order.customerEmail}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {order.items?.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-5 font-black bg-muted">x{item.quantity}</Badge>
                                <span className="text-xs font-bold truncate max-w-[240px]">{item.name}</span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-black text-sm">${order.total?.toLocaleString()} MXN</span>
                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">✓ PAGO CONFIRMADO</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            onClick={() => setSelectedOrder(order)} 
                            className="font-black uppercase text-[10px] tracking-widest h-10 italic bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            VALIDAR / ENTREGAR
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* TAB 2: Historial de entregados */}
          <TabsContent value="history">
            <div className="bg-white border border-border rounded-xl shadow-xl overflow-hidden">
              {filteredHistory.length === 0 ? (
                <div className="p-16 text-center space-y-4">
                  <Package size={48} className="text-muted-foreground mx-auto opacity-30" />
                  <h3 className="text-xl font-black uppercase italic">Sin entregas registradas aún</h3>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Folio / Cliente</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Fecha Entrega</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Evidencia</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Equipos</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Total</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest text-right">Detalle</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.map((order: any) => (
                      <TableRow key={order.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-black text-sm uppercase italic tracking-tighter">#{order.id.substring(0, 8).toUpperCase()}</span>
                            <span className="text-[10px] font-bold text-muted-foreground">{order.customerName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-bold text-muted-foreground">
                            {order.deliveredAt ? format(order.deliveredAt.toDate(), "dd/MM/yyyy HH:mm", { locale: es }) : 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="relative w-16 h-10 bg-muted rounded border border-border overflow-hidden">
                            {order.deliveryPhoto ? (
                              <Image src={order.deliveryPhoto} alt="Evidencia" fill className="object-contain bg-white" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[8px] font-bold uppercase text-muted-foreground">Sin foto</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-bold max-w-[200px] truncate">
                            {order.items?.map((i: any) => `${i.name} (x${i.quantity})`).join(', ')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-black text-sm">${order.total?.toLocaleString()} MXN</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            className="font-black uppercase text-[9px] tracking-widest h-8"
                          >
                            VER FICHA
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ==================================================================== */}
      {/* MODAL DETALLADO DE VALIDACIÓN DE COMPRA Y ENTREGA */}
      {/* ==================================================================== */}
      <Dialog open={!!selectedOrder} onOpenChange={() => { setSelectedOrder(null); setDeliveryPhoto(null); }}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto border-t-8 border-t-primary p-6">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between gap-2 mb-1">
              <Badge className={selectedOrder?.status === 'delivered' ? "bg-blue-600 text-white font-black" : "bg-emerald-600 text-white font-black uppercase text-xs tracking-wider"}>
                {selectedOrder?.status === 'delivered' ? '✓ PEDIDO YA ENTREGADO' : '✓ COMPRA APROBADA - PAGO CONFIRMADO'}
              </Badge>
              <span className="font-mono text-xs font-black text-muted-foreground">
                FOLIO: #{selectedOrder?.id?.substring(0, 8).toUpperCase()}
              </span>
            </div>
            <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
              Detalle de Venta y Recolección
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              ID Oficial en Sistema: <span className="font-mono text-[11px] text-foreground font-bold">{selectedOrder?.id}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            
            {/* Banner de Estado Verde */}
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3">
              <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={24} />
              <div className="space-y-0.5">
                <div className="text-xs font-black uppercase text-emerald-800 tracking-wider">
                  Pago Aprobado y Verificado
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Este pedido fue pagado con tarjeta a través de <strong>Stripe</strong>. Mercancía autorizada para entrega inmediata en planta.
                </p>
              </div>
            </div>

            {/* Datos del Cliente */}
            <div className="bg-muted/60 p-4 rounded-xl border border-border space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Datos del Comprador
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-muted-foreground">Nombre / Empresa:</span>
                <span className="font-black text-sm">{selectedOrder?.customerName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-muted-foreground">Correo Electrónico:</span>
                <a href={`mailto:${selectedOrder?.customerEmail}`} className="font-bold text-primary hover:underline">
                  {selectedOrder?.customerEmail}
                </a>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-muted-foreground">Fecha y Hora de Pago:</span>
                <span className="font-bold">
                  {selectedOrder?.createdAt ? format(selectedOrder.createdAt.toDate(), "dd/MM/yyyy HH:mm 'hrs'", { locale: es }) : 'Reciente'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-muted-foreground">Punto de Entrega:</span>
                <span className="font-bold">{selectedOrder?.pickupLocation || 'Planta Pedro Escobedo, Qro. (LAB planta)'}</span>
              </div>
            </div>

            {/* Lista Detallada de lo que compró */}
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Equipos y Refacciones Compradas:
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

            {/* Resumen Financiero Total */}
            <div className="bg-muted p-4 rounded-xl border border-border flex justify-between items-center">
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Total Pagado:</div>
                <div className="text-[10px] text-muted-foreground">IVA (16%) incluido</div>
              </div>
              <span className="text-2xl font-black text-emerald-600">
                ${selectedOrder?.total?.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </span>
            </div>

            {/* Sección de Evidencia de Entrega */}
            {selectedOrder?.status === 'delivered' ? (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-blue-900 font-black text-xs uppercase">
                  <CheckCircle2 size={16} className="text-blue-600" />
                  Entrega Completada y Documentada
                </div>
                {selectedOrder?.deliveryPhoto && (
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-blue-200">
                    <Image src={selectedOrder.deliveryPhoto} alt="Evidencia de entrega" fill className="object-contain bg-white" />
                  </div>
                )}
                <div className="text-[10px] font-bold text-blue-800">
                  Fecha de entrega física: {selectedOrder?.deliveredAt ? format(selectedOrder.deliveredAt.toDate(), "dd/MM/yyyy HH:mm 'hrs'", { locale: es }) : 'N/A'}
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-2 border-t">
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={16} />
                  <p className="text-[10px] font-bold uppercase text-amber-900 leading-relaxed">
                    Toma o sube una fotografía del equipo cargado en el vehículo del cliente o entregado en el andén como evidencia oficial de entrega.
                  </p>
                </div>

                <div className="relative aspect-video bg-muted border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center overflow-hidden">
                  {deliveryPhoto ? (
                    <>
                      <Image src={deliveryPhoto} alt="Evidencia" fill className="object-contain bg-white" />
                      <Button variant="destructive" size="sm" className="absolute bottom-2 right-2 text-[10px] h-8 font-black uppercase" onClick={() => setDeliveryPhoto(null)}>
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
            )}

          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t">
            <Button variant="outline" className="font-bold uppercase text-[10px]" onClick={() => setSelectedOrder(null)}>
              CERRAR
            </Button>
            {selectedOrder?.status !== 'delivered' && (
              <Button 
                className="font-black uppercase text-[10px] tracking-widest italic bg-emerald-600 hover:bg-emerald-700 text-white h-11" 
                disabled={!deliveryPhoto || isDelivering} 
                onClick={confirmDelivery}
              >
                {isDelivering ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                CONFIRMAR Y ENTREGAR EQUIPO
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminDeliveriesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    }>
      <DeliveriesContent />
    </Suspense>
  );
}
