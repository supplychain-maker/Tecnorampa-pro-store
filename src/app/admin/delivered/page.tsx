
'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, where, doc, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Loader2, 
  PackageCheck, 
  ArrowLeft, 
  Factory, 
  ImageIcon,
  Calendar,
  User as UserIcon
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminDeliveredPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();

  const userDocRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile, loading: profileLoading } = useDoc(userDocRef);
  const isAdmin = profile?.role === 'admin';

  const deliveredQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'orders'),
      where('status', '==', 'delivered')
    );
  }, [db]);

  const { data: deliveredOrders, loading: ordersLoading } = useCollection(deliveredQuery);

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
        <p className="text-muted-foreground mb-6">Solo personal administrativo puede consultar el historial de entregas.</p>
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
            <Link href="/admin/sales" className="text-xs font-black text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 uppercase tracking-[0.2em] mb-4">
              <ArrowLeft size={14} /> Volver a Ventas Pendientes
            </Link>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic border-l-8 border-green-600 pl-6">Historial de Entregas</h1>
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest ml-8">Equipos entregados con evidencia fotográfica</p>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl shadow-xl overflow-hidden">
          {ordersLoading ? (
            <div className="p-20 flex justify-center">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : deliveredOrders.length === 0 ? (
            <div className="p-20 text-center space-y-4">
              <PackageCheck className="mx-auto text-muted-foreground opacity-20" size={64} />
              <h3 className="text-xl font-black uppercase italic">No hay entregas registradas</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">Las ventas entregadas aparecerán aquí una vez que se registre la foto de evidencia.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">ID Pedido / Cliente</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Fecha Entrega</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Evidencia</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Artículos</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveredOrders.map((order: any) => (
                  <TableRow key={order.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-black text-sm uppercase italic tracking-tighter">#{order.id.substring(0, 8).toUpperCase()}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <UserIcon size={12} className="text-muted-foreground" />
                          <span className="text-[10px] font-bold text-muted-foreground">{order.customerName}</span>
                        </div>
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
                          <Image src={order.deliveryPhoto} alt="Evidencia" fill className="object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full"><ImageIcon size={14} className="opacity-20" /></div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        {order.items?.map((item: any, idx: number) => (
                          <span key={idx} className="text-[10px] font-bold truncate max-w-[150px]">x{item.quantity} {item.name}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col">
                        <span className="font-black text-sm">${order.total.toLocaleString()}</span>
                        <Badge className="bg-green-600/10 text-green-600 border-none text-[8px] font-black uppercase p-0 h-4">ENTREGADO</Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
