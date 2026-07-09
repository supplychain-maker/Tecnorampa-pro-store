
'use client';

import { useMemo, useState } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { ProductCard } from '@/components/products/ProductCard';
import { Loader2, AlertTriangle, Database, ArrowRight, LayoutGrid, Tag, Search } from 'lucide-react';
import { Product } from '@/app/lib/products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ProductsPage() {
  const db = useFirestore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Consulta de categorías para los filtros superiores
  const categoriesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), orderBy('name', 'asc'));
  }, [db]);

  const { data: categories, loading: catsLoading } = useCollection(categoriesQuery);

  // Consulta de productos activos
  const productsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'products'),
      where('active', '==', true)
    );
  }, [db]);

  const { data: products, loading: productsLoading, error } = useCollection<Product>(productsQuery);

  // Filtrar productos según la categoría seleccionada y el término de búsqueda
  const filteredProducts = useMemo(() => {
    let results = products;

    if (selectedCategoryId) {
      results = results.filter(p => p.categoryIds?.includes(selectedCategoryId) || p.categoryId === selectedCategoryId);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      results = results.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.shortDescription?.toLowerCase().includes(term)
      );
    }

    return results;
  }, [products, selectedCategoryId, searchTerm]);

  const isLoading = catsLoading || productsLoading;

  return (
    <div className="py-12 bg-background min-h-screen">
      <div className="container mx-auto px-4">
        
        {/* Cabecera con Branding y Buscador */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12 bg-muted/30 p-8 rounded-2xl border-b-4 border-primary">
          <div className="space-y-1 text-center lg:text-left">
            <Badge variant="outline" className="border-primary text-primary px-3 py-1 font-black uppercase text-[10px] tracking-widest mb-2">
              Tecnorampa S.A. de C.V.
            </Badge>
            <h1 className="text-lg md:text-xl font-black uppercase tracking-[0.15em] text-foreground italic">
              Tienda oficial de refacciones industriales
            </h1>
          </div>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={20} />
            <Input 
              placeholder="¿Qué refacción busca hoy?..." 
              className="pl-10 h-12 bg-white border-2 border-border focus:border-primary font-bold shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <header className="mb-12">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4 italic">Catálogo Completo</h2>
          <p className="text-xl text-muted-foreground max-w-2xl font-medium">
            Selecciona un grupo industrial para filtrar nuestras soluciones de ingeniería certificada.
          </p>
        </header>

        {/* Barra de Filtros por Categoría */}
        <div className="mb-12 space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
            <LayoutGrid size={14} className="text-primary" /> Filtrar por Grupo:
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedCategoryId === null ? "default" : "outline"}
              onClick={() => setSelectedCategoryId(null)}
              className={cn(
                "h-12 px-6 font-black uppercase tracking-widest text-xs italic transition-all",
                selectedCategoryId === null ? "shadow-lg scale-105" : "hover:border-primary"
              )}
            >
              Todos los Equipos
            </Button>
            {categories.map((cat: any) => (
              <Button
                key={cat.id}
                variant={selectedCategoryId === cat.id ? "default" : "outline"}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={cn(
                  "h-12 px-6 font-black uppercase tracking-widest text-xs italic transition-all",
                  selectedCategoryId === cat.id ? "shadow-lg scale-105" : "hover:border-primary"
                )}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="animate-spin text-primary mb-4" size={48} />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs italic">Sincronizando Inventario...</p>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/20 p-12 rounded-xl text-center max-w-2xl mx-auto shadow-xl">
            <AlertTriangle className="text-destructive mx-auto mb-4" size={48} />
            <h3 className="text-xl font-black uppercase mb-2 italic">Falla de Comunicación</h3>
            <p className="text-muted-foreground font-medium">No pudimos sincronizar con el centro de datos. Reintente en un momento.</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-6 font-black uppercase">Reintentar</Button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl bg-white/50 backdrop-blur max-w-2xl mx-auto px-6 shadow-inner">
            <Database className="mx-auto mb-4 text-muted-foreground opacity-20" size={64} />
            <h3 className="text-2xl font-black uppercase italic mb-2">Base de Datos no Inicializada</h3>
            <p className="text-muted-foreground font-medium mb-8">
              El ecosistema digital Tecnorampa aún no tiene productos registrados en este entorno.
            </p>
            <Link href="/setup">
              <Button size="lg" className="font-black uppercase tracking-widest text-xs h-14 px-8 shadow-xl">
                Cargar Inventario Maestro <ArrowRight className="ml-2" size={16} />
              </Button>
            </Link>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-muted/30 rounded-2xl border border-border">
            <Tag className="mx-auto mb-4 text-muted-foreground opacity-20" size={48} />
            <p className="text-lg font-black uppercase italic text-muted-foreground">No se encontraron productos coincidentes</p>
            <Button 
              variant="link" 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategoryId(null);
              }} 
              className="mt-2 font-bold uppercase text-primary"
            >
              Limpiar búsqueda y filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <div key={product.id || product.slug} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
