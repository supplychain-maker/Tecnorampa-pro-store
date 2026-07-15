'use client';

/**
 * Tecnorampa Pro-Store - Home Page
 * Versión blindada v2.1 - Despliegue industrial garantizado
 */

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/products/ProductCard';
import { 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  LayoutGrid,
  Database,
  MessageSquareCode,
  Search
} from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Product } from '@/app/lib/products';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const ITEMS_PER_PAGE = 8;

export default function Home() {
  const db = useFirestore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const categoriesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), orderBy('name', 'asc'));
  }, [db]);
  const { data: categories, loading: catsLoading } = useCollection(categoriesQuery);

  const productsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'products'), where('active', '==', true));
  }, [db]);
  const { data: allProducts, loading: productsLoading } = useCollection<Product>(productsQuery);

  const filteredProducts = useMemo(() => {
    let results = allProducts || [];
    if (selectedCategoryId) {
      results = results.filter(p => p.categoryIds?.includes(selectedCategoryId) || p.categoryId === selectedCategoryId);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      results = results.filter(p => p.name.toLowerCase().includes(term) || p.shortDescription?.toLowerCase().includes(term));
    }
    return results;
  }, [allProducts, selectedCategoryId, searchTerm]);

  const totalPages = Math.ceil((filteredProducts?.length || 0) / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const isLoading = (catsLoading || productsLoading) && db !== null;

  return (
    <div className="flex flex-col bg-background">
      <section className="py-12 industrial-grid bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12 bg-muted/30 p-8 rounded-2xl border-b-4 border-primary">
            <div className="space-y-1">
              <h1 className="text-lg md:text-xl font-black uppercase tracking-[0.15em] text-foreground italic">
                Tecnorampa Pro-Store v2.1
              </h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Suministros industriales certificados • Deploy Ready
              </p>
            </div>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={20} />
              <Input 
                placeholder="Buscar equipo o refacción..." 
                className="pl-10 h-12 bg-white border-2 border-border focus:border-primary font-bold shadow-sm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase mb-4 text-foreground italic">Equipos Destacados</h2>
              <div className="w-24 h-1.5 bg-primary" />
            </div>
          </div>

          <div className="mb-12 space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
              <LayoutGrid size={14} className="text-primary" /> Filtrar por Grupo Industrial:
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={selectedCategoryId === null ? "default" : "outline"}
                onClick={() => { setSelectedCategoryId(null); setCurrentPage(1); }}
                className={cn("h-12 px-6 font-black uppercase tracking-widest text-xs italic transition-all", selectedCategoryId === null ? "shadow-lg scale-105" : "hover:border-primary")}
              >
                Todos los Equipos
              </Button>
              {categories && categories.map((cat: any) => (
                <Button
                  key={cat.id}
                  variant={selectedCategoryId === cat.id ? "default" : "outline"}
                  onClick={() => { setSelectedCategoryId(cat.id); setCurrentPage(1); }}
                  className={cn("h-12 px-6 font-black uppercase tracking-widest text-xs italic transition-all", selectedCategoryId === cat.id ? "shadow-lg scale-105" : "hover:border-primary")}
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
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-border rounded-2xl bg-white/50 backdrop-blur max-w-2xl mx-auto px-6 shadow-inner">
              <Database className="mx-auto mb-4 text-muted-foreground opacity-20" size={64} />
              <p className="text-lg font-black uppercase italic text-muted-foreground">No se encontraron productos</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {paginatedProducts.map(product => (
                  <div key={product.id || product.slug} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-16 flex justify-center items-center gap-4">
                  <Button variant="outline" size="icon" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} className="h-12 w-12 border-2">
                    <ChevronLeft size={24} />
                  </Button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button key={page} variant={currentPage === page ? "default" : "outline"} onClick={() => setCurrentPage(page)} className={cn("h-12 w-12 font-black italic", currentPage === page ? "shadow-lg" : "text-muted-foreground")}>
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button variant="outline" size="icon" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} className="h-12 w-12 border-2">
                    <ChevronRight size={24} />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="py-24 overflow-hidden bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="absolute top-0 right-0 opacity-10 -mr-20 -mt-20">
              <MessageSquareCode size={400} />
            </div>
            <div className="max-w-xl space-y-6 relative z-10">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none italic">¿Dudas Técnicas?</h2>
              <p className="text-lg opacity-90 font-medium">Usa nuestro Asistente Inteligente de Logística para recibir recomendaciones personalizadas.</p>
              <Link href="/assistant" className="inline-block">
                <Button variant="secondary" size="lg" className="h-14 px-8 text-lg font-bold bg-white text-primary hover:bg-white/90 uppercase italic tracking-widest">
                  Consultar al Asistente IA
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
