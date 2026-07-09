
'use client';

import { useMemo, useState } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Phone, 
  User as UserIcon, 
  ArrowLeft, 
  Factory, 
  Search,
  Camera,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminSalesPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredSales = useMemo(() => {
    if (!searchTerm.trim()) return sales;
    return sales.filter((order: any) => 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sales, searchTerm]);

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
        <p className="text-muted-foreground mb-6">Solo personal administrativo puede gestionar las entregas.</p>
        <Link href="/">
          <Button variant="outline">Volver al Inicio</Button>
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
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic border-l-8 border-primary pl-6">Ventas a Entregar</h1>
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest ml-8">Logística de pedidos confirmados por Stripe</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Buscar ID de pedido..." 
                className="pl-10 h-12 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl shadow-xl overflow-hidden">
          {salesLoading ? (
            <div className="p-20 flex justify-center">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="p-20 text-center space-y-4">
              <Package className="mx-auto text-muted-foreground opacity-20" size={64} />
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
                        <span className="font-black text-sm">${order.total.toLocaleString()}</span>
                        <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">PAGO CONFIRMADO</span>
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
                ES REQUISITO SUBIR UNA FOTO DEL EQUIPO ENTREGADO EN EL ANDÉN O VEHÍCULO DEL CLIENTE COMO EVIDENCIA.
              </p>
            </div>

            <div className="space-y-4">
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
                      ELIMINAR
                    </Button>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2">
                    <Camera size={40} className="text-muted-foreground opacity-30" />
                    <span className="text-[10px] font-black uppercase tracking-widest">SUBIR FOTO DE EVIDENCIA</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoCapture} />
                  </label>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="font-bold uppercase text-[10px]" onClick={() => setSelectedOrder(null)}>CANCELAR</Button>
            <Button 
              className="font-black uppercase text-[10px] tracking-widest italic" 
              disabled={!deliveryPhoto || isDelivering}
              onClick={confirmDelivery}
            >
              {isDelivering ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              REGISTRAR ENTREGA FINAL
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
