
'use client';

import { useMemo, useState } from 'react';
import { useFirestore, useCollection, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Minus, Pencil, Trash2, Eye, EyeOff, Loader2, Factory, Package, ArrowLeft, Clock, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/app/lib/products';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useRouter } from 'next/navigation';
import { getDirectImageUrl, cn } from '@/lib/utils';

export default function AdminProductsPage() {
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const userDocRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile, loading: profileLoading } = useDoc(userDocRef);
  const isAdmin = profile?.role === 'admin';

  const productsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: products, loading: productsLoading } = useCollection<Product>(productsQuery);

  const toggleStatus = (product: Product) => {
    if (!db || !product.id) return;
    const productRef = doc(db, 'products', product.id);
    const newStatus = !product.active;
    
    updateDoc(productRef, { active: newStatus })
      .then(() => {
        toast({ title: "Estado Actualizado", description: `${product.name} ahora está ${newStatus ? 'activo' : 'inactivo'}.` });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: productRef.path,
          operation: 'update',
          requestResourceData: { active: newStatus }
        }));
      });
  };

  const handleQuickStock = (product: Product, newStock: number) => {
    if (!db || !product.id) return;
    const productRef = doc(db, 'products', product.id);
    
    updateDoc(productRef, { stock: newStock })
      .then(() => {
        toast({ 
          title: "Stock Actualizado", 
          description: `${product.name}: ${newStock} unidades en stock (${newStock > 0 ? 'Entrega Inmediata' : 'Sin stock'}).` 
        });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: productRef.path,
          operation: 'update',
          requestResourceData: { stock: newStock }
        }));
      });
  };

  const handleDelete = (product: Product) => {
    if (!db || !product.id || !confirm(`¿Está seguro de eliminar ${product.name}?`)) return;
    const productRef = doc(db, 'products', product.id);
    
    deleteDoc(productRef)
      .then(() => {
        toast({ title: "Producto Eliminar", description: "El equipo ha sido retirado del sistema." });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: productRef.path,
          operation: 'delete'
        }));
      });
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
        <p className="text-muted-foreground mb-6">Solo personal autorizado puede gestionar el catálogo industrial.</p>
        <Link href="/">
          <Button variant="outline">Volver al Inicio</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 industrial-grid min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="space-y-1">
            <Link href="/" className="text-xs font-black text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 uppercase tracking-[0.2em] mb-4">
              <ArrowLeft size={14} /> Volver a Tienda
            </Link>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic border-l-8 border-primary pl-6">Gestión de Inventario</h1>
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest ml-8">Panel de Administración Tecnorampa</p>
          </div>
          <Link href="/admin/products/new">
            <Button className="h-14 px-8 font-black uppercase tracking-widest text-xs italic shadow-lg">
              <Plus className="mr-2 h-5 w-5" /> AGREGAR NUEVO EQUIPO
            </Button>
          </Link>
        </div>

        <div className="bg-white border border-border rounded-xl shadow-xl overflow-hidden">
          {productsLoading ? (
            <div className="p-20 flex justify-center">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : products.length === 0 ? (
            <div className="p-20 text-center text-muted-foreground italic">
              No hay productos en el catálogo.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest w-[100px]">Imagen</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Producto</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Grupos</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Precio</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Stock / Entrega</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Estado</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id || product.slug} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="relative w-16 h-12 bg-muted rounded overflow-hidden border border-border">
                        <Image 
                          src={getDirectImageUrl(product.image)} 
                          alt={product.name} 
                          fill 
                          className="object-cover" 
                          unoptimized 
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-black uppercase text-sm italic">{product.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{product.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.categoryNames?.map((cat, i) => (
                          <Badge key={i} variant="outline" className="text-[8px] font-black uppercase px-1 py-0 h-4">{cat}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-primary">
                      ${product.price.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5 min-w-[150px]">
                        <div className="flex items-center gap-1.5">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6 text-xs p-0 shrink-0 hover:bg-muted" 
                            title="Reducir stock"
                            onClick={() => handleQuickStock(product, Math.max(0, (Number(product.stock) || 0) - 1))}
                          >
                            <Minus size={10} />
                          </Button>
                          <span className={cn(
                            "font-mono font-black text-xs px-2 py-0.5 rounded border text-center min-w-[28px]",
                            (product.stock ?? 0) > 0 
                              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" 
                              : "bg-muted text-muted-foreground border-border"
                          )}>
                            {product.stock ?? 0}
                          </span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6 text-xs p-0 shrink-0 hover:bg-muted" 
                            title="Aumentar stock"
                            onClick={() => handleQuickStock(product, (Number(product.stock) || 0) + 1)}
                          >
                            <Plus size={10} />
                          </Button>
                          {(product.stock ?? 0) > 0 ? (
                            <Badge className="bg-emerald-600/10 text-emerald-600 border-emerald-600/30 text-[8px] font-black uppercase px-1.5 py-0 h-4">
                              <Zap size={8} className="mr-0.5 inline" /> Inmediata
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-600/30 bg-amber-500/5 text-[8px] font-black uppercase px-1.5 py-0 h-4">
                              Sin stock
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium truncate flex items-center gap-1" title={product.deliveryTime || '3 a 5 días hábiles'}>
                          <Clock size={10} className="shrink-0 text-primary" />
                          {product.deliveryTime || '3 a 5 días hábiles'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.active ? (
                        <Badge className="bg-green-600/10 text-green-600 border-green-600/20 text-[9px] font-black uppercase tracking-widest">Activo</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest opacity-50">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title={product.active ? "Desactivar" : "Activar"}
                          onClick={() => toggleStatus(product)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          {product.active ? <EyeOff size={18} /> : <Eye size={18} />}
                        </Button>
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Button variant="ghost" size="icon" className="hover:bg-blue-600/10 hover:text-blue-600">
                            <Pencil size={18} />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(product)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 size={18} />
                        </Button>
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
