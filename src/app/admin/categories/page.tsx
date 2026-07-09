
'use client';

import { useMemo, useState } from 'react';
import { useFirestore, useCollection, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Loader2, Factory, ArrowLeft, LayoutGrid, Tag } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function AdminCategoriesPage() {
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  
  const [newCatName, setNewCatName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [open, setOpen] = useState(false);

  const userDocRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile, loading: profileLoading } = useDoc(userDocRef);
  const isAdmin = profile?.role === 'admin';

  const categoriesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), orderBy('name', 'asc'));
  }, [db]);

  const { data: categories, loading: catsLoading } = useCollection(categoriesQuery);

  const handleAddCategory = async () => {
    if (!db || !newCatName.trim()) return;
    setIsAdding(true);
    
    const slug = newCatName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const catData = {
      name: newCatName,
      slug,
      createdAt: serverTimestamp()
    };

    addDoc(collection(db, 'categories'), catData)
      .then(() => {
        toast({ title: "Grupo Creado", description: `El grupo "${newCatName}" ha sido añadido.` });
        setNewCatName('');
        setOpen(false);
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'categories',
          operation: 'create',
          requestResourceData: catData
        }));
      })
      .finally(() => setIsAdding(false));
  };

  const handleDelete = (cat: any) => {
    if (!db || !cat.id || !confirm(`¿Eliminar el grupo "${cat.name}"? Los productos asociados podrían quedar sin categoría.`)) return;
    
    deleteDoc(doc(db, 'categories', cat.id))
      .then(() => {
        toast({ title: "Grupo Eliminado", description: "La categoría ha sido removida." });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `categories/${cat.id}`,
          operation: 'delete'
        }));
      });
  };

  if (authLoading || profileLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <Factory size={64} className="text-muted-foreground mb-4 opacity-20" />
        <h2 className="text-2xl font-black uppercase tracking-tighter">Acceso Restringido</h2>
        <Link href="/"><Button variant="outline" className="mt-4">Volver al Inicio</Button></Link>
      </div>
    );
  }

  return (
    <div className="py-12 industrial-grid min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="space-y-1">
            <Link href="/admin/products" className="text-xs font-black text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 uppercase tracking-[0.2em] mb-4">
              <ArrowLeft size={14} /> Gestión de Inventario
            </Link>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic border-l-8 border-primary pl-6">Grupos de Productos</h1>
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest ml-8">Organización del catálogo Tecnorampa</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="h-14 px-8 font-black uppercase tracking-widest text-xs italic shadow-lg">
                <Plus className="mr-2 h-5 w-5" /> CREAR NUEVO GRUPO
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase italic">Nuevo Grupo Industrial</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nombre del Grupo</Label>
                  <Input 
                    value={newCatName} 
                    onChange={(e) => setNewCatName(e.target.value)} 
                    placeholder="Ej: Equipos para Andén"
                    className="h-12"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button 
                  onClick={handleAddCategory} 
                  disabled={isAdding || !newCatName.trim()}
                  className="font-black uppercase italic"
                >
                  {isAdding ? <Loader2 className="animate-spin mr-2" /> : <Tag className="mr-2" />}
                  GUARDAR GRUPO
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white border border-border rounded-xl shadow-xl overflow-hidden">
          {catsLoading ? (
            <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
          ) : categories.length === 0 ? (
            <div className="p-20 text-center space-y-4">
              <LayoutGrid className="mx-auto text-muted-foreground opacity-20" size={64} />
              <p className="text-muted-foreground italic">No hay grupos definidos.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Nombre del Grupo</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Slug (URL)</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat: any) => (
                  <TableRow key={cat.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="font-black uppercase text-sm italic">{cat.name}</TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">{cat.slug}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(cat)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 size={18} />
                      </Button>
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
