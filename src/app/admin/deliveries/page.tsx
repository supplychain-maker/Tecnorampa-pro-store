
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
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
  ImageIcon,
  Calendar,
  CreditCard,
  Zap,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Globe,
  Monitor,
  Info
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminDeliveriesPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [deliveryPhoto, setDeliveryPhoto] = useState<string | null>(null);
  const [isDelivering, setIsDelivering] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/stripe/config-status')
      .then(res => res.json())
      .then(data => setStripeStatus(data))
      .catch(() => setStripeStatus({ error: true }));
  }, []);

  const isProduction = typeof window !== 'undefined' && !window.location.hostname.includes('cloudworkstations.dev');

  const generatedWebhookUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/api/stripe/webhook`;
  }, []);

  const copyToClipboard = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(generatedWebhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "URL Copiada", description: "Pégala en el panel de Webhooks de Stripe." });
    }
  };

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

  const { data: pendingSales, loading: pendingLoading } = useCollection(pendingQuery);
  const { data: historySales, loading: historyLoading } = useCollection(historyQuery);

  const filteredPending = useMemo(() => {
    if (!searchTerm.trim()) return pendingSales;
    return pendingSales.filter((order: any) => 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [pendingSales, searchTerm]);

  const filteredHistory = useMemo(() => {
    if (!searchTerm.trim()) return historySales;
    return historySales.filter((order: any) => 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [historySales, searchTerm]);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

    updateDoc(orderRef, updateData)
      .then(() => {
        toast({ title: "Entrega Registrada", description: "El pedido ha sido marcado como entregado con éxito." });
        setSelectedOrder(null);
        setDeliveryPhoto(null);
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: orderRef.path,
          operation: 'update',
          requestResourceData: updateData
        }));
      })
      .finally(() => setIsDelivering(false));
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <Factory size={64} className="text-muted-foreground mb-4 opacity-20" />
        <h2 className="text-2xl font-black uppercase tracking-tighter">Acceso Restringido</h2>
        <Link href="/">
          <Button variant="outline" className="mt-4">Volver al Inicio</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 industrial-grid min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="space-y-1">
            <Link href="/admin/products" className="text-xs font-black text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 uppercase tracking-[0.2em] mb-4">
              <ArrowLeft size={14} /> Gestión de Catálogo
            </Link>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic border-l-8 border-primary pl-6">Gestión de Entregas</h1>
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest ml-8">Logística y evidencia de pedidos industriales</p>
          </div>
          
          <div className="flex flex-col gap-4">
            {stripeStatus && (
              <div className="bg-white border-2 border-primary/20 p-5 rounded-xl shadow-xl flex flex-col gap-3 min-w-[350px]">
                <div className="flex items-center justify-between border-b pb-3 mb-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="text-primary" size={20} />
                    <span className="text-[11px] font-black uppercase tracking-widest text-foreground">Estado de Pagos</span>
                  </div>
                  {stripeStatus.mode === 'live' ? (
                    <Badge className="bg-green-600 text-white text-[10px] font-black uppercase italic animate-pulse">
                      <ShieldCheck size={10} className="mr-1" /> MODO REAL (LIVE)
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-[10px] font-black uppercase italic">
                      <AlertTriangle size={10} className="mr-1" /> MODO PRUEBA (TEST)
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-muted/50 p-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      {isProduction ? <Globe className="text-green-600" size={14} /> : <Monitor className="text-blue-600" size={14} />}
                      <span className="text-[9px] font-black uppercase">{isProduction ? 'Entorno: Producción' : 'Entorno: Editor (Preview)'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Prefijo de Llave:</span>
                    <code className="text-[10px] font-black font-mono bg-muted px-2 py-0.5 rounded text-primary">
                      {stripeStatus.keyPrefix || 'MISSING'}...
                    </code>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Estado Webhook:</span>
                    {stripeStatus.webhookConfigured ? (
                      <Badge variant="outline" className="text-[9px] font-black text-green-600 border-green-600/30 gap-1 uppercase bg-green-50">
                        <Zap size={8} /> CONFIGURADO
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] font-black text-destructive border-destructive/30 bg-destructive/5 uppercase">PENDIENTE</Badge>
                    )}
                  </div>
                  
                  {!isProduction && (
                    <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-start gap-2">
                      <Info size={14} className="text-blue-700 shrink-0 mt-0.5" />
                      <p className="text-[8px] font-bold text-blue-700 uppercase leading-relaxed">
                        Nota: Estás usando tus llaves reales en el entorno de desarrollo. Ten cuidado con los cargos reales.
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-muted p-3 rounded-lg space-y-2 border border-border">
                    <label className="text-[8px] font-black text-muted-foreground uppercase block">URL Webhook para Stripe:</label>
                    <div className="flex items-center gap-2 bg-white border border-border p-1.5 rounded">
                      <code className="text-[9px] font-mono truncate flex-grow px-1 text-primary">{generatedWebhookUrl}</code>
                      <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-primary/10" onClick={copyToClipboard}>
                        {copied ? <Check className="text-green-600" size={14} /> : <Copy size={14} />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Buscar por ID o Cliente..." 
                className="pl-10 h-12 bg-white border-2 border-border focus:border-primary font-bold shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="pending" className="space-y-8">
          <TabsList className="bg-muted/50 p-1 h-14 border border-border">
            <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase text-xs italic tracking-widest px-8 h-full">
              <ClipboardList className="mr-2 h-4 w-4" /> Ventas a Entregar
              {pendingSales.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                  {pendingSales.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-foreground data-[state=active]:text-background font-black uppercase text-xs italic tracking-widest px-8 h-full">
              <History className="mr-2 h-4 w-4" /> Historial de Entregas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="animate-in fade-in-50">
            <div className="bg-white border border-border rounded-xl shadow-xl overflow-hidden">
              {pendingLoading ? (
                <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
              ) : filteredPending.length === 0 ? (
                <div className="p-20 text-center space-y-4">
                  <Package className="mx-auto text-muted-foreground opacity-20" size={64} />
                  <h3 className="text-xl font-black uppercase italic">No hay ventas pendientes</h3>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Pedido / Fecha</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Cliente / Contacto</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Equipos</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Total</TableHead>
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
                            <div className="flex items-center gap-2">
                              <UserIcon size={12} className="text-muted-foreground" />
                              <span className="font-bold text-sm">{order.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail size={12} className="text-primary" />
                              <span className="text-[10px] font-medium text-muted-foreground">{order.customerEmail}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {order.items?.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 font-black">x{item.quantity}</Badge>
                                <span className="text-xs font-bold truncate max-w-[150px]">{item.name}</span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-black text-sm">${order.total.toLocaleString()}</span>
                            <span className="text-[9px] font-black text-green-600 uppercase">PAGADO</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button onClick={() => setSelectedOrder(order)} className="font-black uppercase text-[10px] tracking-widest h-10 italic">
                            ENTREGAR
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="animate-in fade-in-50">
            <div className="bg-white border border-border rounded-xl shadow-xl overflow-hidden">
              {historyLoading ? (
                <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
              ) : filteredHistory.length === 0 ? (
                <div className="p-20 text-center space-y-4">
                  <PackageCheck className="mx-auto text-muted-foreground opacity-20" size={64} />
                  <h3 className="text-xl font-black uppercase italic">Historial Vacío</h3>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Pedido / Cliente</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Fecha Entrega</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Evidencia</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Artículos</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest text-right">Monto</TableHead>
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
                          <div className="flex items-center gap-2">
                            <Calendar size={12} className="text-primary" />
                            <span className="text-[10px] font-bold">
                              {order.deliveredAt ? format(order.deliveredAt.toDate(), "dd/MM/yyyy HH:mm", { locale: es }) : 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="relative w-16 h-10 bg-muted rounded border border-border overflow-hidden">
                            {order.deliveryPhoto ? (
                              <Image src={order.deliveryPhoto} alt="Evidencia" fill className="object-contain bg-white" />
                            ) : (
                              <div className="flex items-center justify-center h-full"><ImageIcon size={14} className="opacity-20" /></div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            {order.items?.map((item: any, idx: number) => (
                              <span key={idx} className="text-[10px] font-bold truncate max-w-[120px]">x{item.quantity} {item.name}</span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-black text-sm">${order.total.toLocaleString()}</span>
                          <div className="text-[8px] font-black text-green-600 uppercase">ENTREGADO</div>
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

      {/* Modal de Entrega */}
      <Dialog open={!!selectedOrder} onOpenChange={() => { setSelectedOrder(null); setDeliveryPhoto(null); }}>
        <DialogContent className="sm:max-w-md border-t-8 border-t-primary">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Confirmar Entrega</DialogTitle>
            <DialogDescription className="font-bold text-xs uppercase text-muted-foreground">
              Pedido: #{selectedOrder?.id?.substring(0, 8).toUpperCase()} para {selectedOrder?.customerName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="bg-muted p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-primary shrink-0" size={20} />
              <p className="text-[10px] font-bold uppercase leading-relaxed text-muted-foreground italic">
                ES REQUISITO SUBIR UNA FOTO DEL EQUIPO ENTREGADO COMO EVIDENCIA FINAL.
              </p>
            </div>

            <div className="relative aspect-video bg-muted border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center overflow-hidden">
              {deliveryPhoto ? (
                <>
                  <Image src={deliveryPhoto} alt="Evidencia" fill className="object-contain bg-white" />
                  <Button variant="destructive" size="sm" className="absolute bottom-2 right-2 text-[10px] h-8 font-black uppercase" onClick={() => setDeliveryPhoto(null)}>ELIMINAR</Button>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2">
                  <Camera size={40} className="text-muted-foreground opacity-30" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-center">SUBIR FOTO DE EVIDENCIA</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoCapture} />
                </label>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="font-bold uppercase text-[10px]" onClick={() => setSelectedOrder(null)}>CANCELAR</Button>
            <Button className="font-black uppercase text-[10px] tracking-widest italic" disabled={!deliveryPhoto || isDelivering} onClick={confirmDelivery}>
              {isDelivering ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              REGISTRAR ENTREGA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
