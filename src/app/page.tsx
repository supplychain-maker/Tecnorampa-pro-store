'use client';

/**
 * Tecnorampa Pro-Store - Home Page
 * Versión de Producción Resiliente v3.4 - Organización en 3 Macro-Grupos y Subgrupos
 */

import { useMemo, useState, useEffect } from 'react';
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
  Search,
  ShieldCheck,
  AlertTriangle,
  RefreshCcw,
  Warehouse,
  Car,
  Wrench,
  Layers,
  X
} from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Product } from '@/app/lib/products';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const ITEMS_PER_PAGE = 8;

const MAIN_GROUPS_CONFIG = [
  { id: 'all', name: 'Todos los Equipos', icon: LayoutGrid, subGroups: [] },
  { 
    id: 'anden', 
    name: 'Andén de Carga', 
    icon: Warehouse, 
    subGroups: ['Niveladoras y Mini Docks', 'Seguridad e Iluminación', 'Protección de Andén'] 
  },
  { 
    id: 'estacionamiento', 
    name: 'Estacionamiento', 
    icon: Car, 
    subGroups: ['Duplicadores de Autos'] 
  },
  { 
    id: 'refacciones', 
    name: 'Refacciones Industriales', 
    icon: Wrench, 
    subGroups: ['Mecánicas y Retención', 'Hidráulica', 'Control y Eléctrico', 'Baleros y Rodamientos'] 
  }
];

export default function Home() {
  const db = useFirestore();
  const [selectedMainGroup, setSelectedMainGroup] = useState<string>('all');
  const [selectedSubGroup, setSelectedSubGroup] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [connectionTimeout, setConnectionTimeout] = useState(false);

  // Monitor de tiempo de carga para detectar fallas de red
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!allProducts || allProducts.length === 0) {
        setConnectionTimeout(true);
      }
    }, 8000); 
    return () => clearTimeout(timer);
  }, []);

  // EFECTO DE SCROLL: Sube al inicio cuando cambia la página o filtro
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, selectedMainGroup, selectedSubGroup]);

  const productsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'products'), where('active', '==', true));
  }, [db]);
  const { data: allProducts, loading: productsLoading, error: productsError } = useCollection<Product>(productsQuery);

  const groupCounts = useMemo(() => {
    const list = allProducts || [];
    return {
      all: list.length,
      anden: list.filter(p => p.mainGroup === 'anden' || p.categoryNames?.some(c => c.toLowerCase().includes('andén') || c.toLowerCase().includes('rampas'))).length,
      estacionamiento: list.filter(p => p.mainGroup === 'estacionamiento' || p.categoryNames?.some(c => c.toLowerCase().includes('estacionamiento'))).length,
      refacciones: list.filter(p => p.mainGroup === 'refacciones' || p.categoryNames?.some(c => c.toLowerCase().includes('refacc') || c.toLowerCase().includes('baleros') || c.toLowerCase().includes('hidrául') || c.toLowerCase().includes('control'))).length,
    };
  }, [allProducts]);

  const activeGroupConfig = useMemo(() => {
    return MAIN_GROUPS_CONFIG.find(g => g.id === selectedMainGroup);
  }, [selectedMainGroup]);

  const filteredProducts = useMemo(() => {
    let results = allProducts || [];

    // 1. Filtro por Macro-Grupo
    if (selectedMainGroup !== 'all') {
      results = results.filter(p => {
        if (p.mainGroup) return p.mainGroup === selectedMainGroup;
        if (selectedMainGroup === 'anden') return p.categoryNames?.some(c => c.toLowerCase().includes('andén') || c.toLowerCase().includes('rampas'));
        if (selectedMainGroup === 'estacionamiento') return p.categoryNames?.some(c => c.toLowerCase().includes('estacionamiento'));
        if (selectedMainGroup === 'refacciones') return p.categoryNames?.some(c => c.toLowerCase().includes('refacc') || c.toLowerCase().includes('baleros') || c.toLowerCase().includes('hidrául') || c.toLowerCase().includes('control'));
        return true;
      });
    }

    // 2. Filtro por Subgrupo
    if (selectedSubGroup) {
      results = results.filter(p => p.subGroup === selectedSubGroup || p.categoryNames?.includes(selectedSubGroup));
    }

    // 3. Filtro por Búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      results = results.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.shortDescription?.toLowerCase().includes(term) ||
        p.subGroup?.toLowerCase().includes(term) ||
        p.mainGroupName?.toLowerCase().includes(term)
      );
    }

    return results;
  }, [allProducts, selectedMainGroup, selectedSubGroup, searchTerm]);

  const totalPages = Math.ceil((filteredProducts?.length || 0) / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const isLoading = productsLoading && !productsError && !connectionTimeout;

  const handleResetFilters = () => {
    setSelectedMainGroup('all');
    setSelectedSubGroup(null);
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col bg-background">
      <section className="py-12 industrial-grid bg-white">
        <div className="container mx-auto px-4">
          {/* Header Banner */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12 bg-muted/30 p-8 rounded-2xl border-b-4 border-primary">
            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-[0.15em] text-foreground italic">
                Tecnorampa Pro-Store <span className="text-[10px] not-italic font-bold opacity-30">v3.4</span>
              </h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={12} className="text-primary" /> Soluciones Industriales Certificadas
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
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-foreground italic">Equipos Destacados</h2>
              <div className="w-24 h-1.5 bg-primary" />
            </div>
          </div>

          {/* Selector de Macro-Grupos y Subgrupos */}
          <div className="mb-12 space-y-4 bg-muted/20 p-6 rounded-2xl border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                <Layers size={16} className="text-primary" /> Grupos Principales:
              </div>
              {(selectedMainGroup !== 'all' || selectedSubGroup !== null || searchTerm) && (
                <button
                  onClick={handleResetFilters}
                  className="text-[10px] font-black uppercase text-primary hover:underline flex items-center gap-1"
                >
                  <X size={12} /> Limpiar Filtros
                </button>
              )}
            </div>

            {/* Fila 1: Macro-Grupos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {MAIN_GROUPS_CONFIG.map((group) => {
                const Icon = group.icon;
                const isSelected = selectedMainGroup === group.id;
                const count = groupCounts[group.id as keyof typeof groupCounts] || 0;

                return (
                  <button
                    key={group.id}
                    onClick={() => {
                      setSelectedMainGroup(group.id);
                      setSelectedSubGroup(null);
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border-2 font-black uppercase text-xs italic tracking-wider transition-all text-left",
                      isSelected 
                        ? "bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02]" 
                        : "bg-white text-foreground border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon size={18} className={cn("shrink-0", isSelected ? "text-primary-foreground" : "text-primary")} />
                      <span className="truncate">{group.name}</span>
                    </div>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 shrink-0",
                      isSelected ? "bg-black/20 text-white" : "bg-muted text-muted-foreground"
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Fila 2: Subgrupos contextuales */}
            {activeGroupConfig && activeGroupConfig.subGroups.length > 0 && (
              <div className="pt-3 border-t border-border/60 flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-1">
                  Subgrupos de {activeGroupConfig.name}:
                </span>
                <Button
                  size="sm"
                  variant={selectedSubGroup === null ? "default" : "secondary"}
                  onClick={() => { setSelectedSubGroup(null); setCurrentPage(1); }}
                  className={cn(
                    "h-8 px-3 text-[11px] font-black uppercase tracking-wider rounded-full",
                    selectedSubGroup === null ? "bg-foreground text-background hover:bg-foreground/90" : "bg-muted hover:bg-muted/80 text-foreground"
                  )}
                >
                  Ver Todos ({groupCounts[selectedMainGroup as keyof typeof groupCounts] || 0})
                </Button>
                {activeGroupConfig.subGroups.map((sub) => {
                  const isSubActive = selectedSubGroup === sub;
                  const subCount = (allProducts || []).filter(p => 
                    (p.subGroup === sub || p.categoryNames?.includes(sub)) && 
                    (selectedMainGroup === 'all' || p.mainGroup === selectedMainGroup)
                  ).length;

                  return (
                    <Button
                      key={sub}
                      size="sm"
                      variant={isSubActive ? "default" : "outline"}
                      onClick={() => { setSelectedSubGroup(sub); setCurrentPage(1); }}
                      className={cn(
                        "h-8 px-3 text-[11px] font-black uppercase tracking-wider rounded-full transition-all",
                        isSubActive 
                          ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                          : "bg-white border-border hover:border-primary/60 text-foreground"
                      )}
                    >
                      {sub} {subCount > 0 && <span className="ml-1 opacity-75">({subCount})</span>}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="animate-spin text-primary mb-4" size={48} />
              <p className="text-muted-foreground font-black uppercase tracking-widest text-xs italic">Sincronizando Inventario...</p>
            </div>
          ) : (productsError || (connectionTimeout && filteredProducts.length === 0)) ? (
            <div className="text-center py-24 border-2 border-dashed border-destructive/20 rounded-2xl bg-destructive/5 max-w-2xl mx-auto px-6 shadow-inner">
              <AlertTriangle className="mx-auto mb-4 text-destructive" size={64} />
              <p className="text-lg font-black uppercase italic text-destructive mb-4">Falla de Conexión en Red</p>
              <p className="text-sm text-muted-foreground mb-8">No pudimos enlazar con el servidor de inventario. Esto puede deberse a la señal de internet o configuración de red.</p>
              <Button onClick={() => window.location.reload()} className="font-black uppercase tracking-widest italic">
                <RefreshCcw className="mr-2" size={16} /> REINTENTAR CONEXIÓN
              </Button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-border rounded-2xl bg-white/50 backdrop-blur max-w-2xl mx-auto px-6 shadow-inner">
              <Database className="mx-auto mb-4 text-muted-foreground opacity-20" size={64} />
              <p className="text-lg font-black uppercase italic text-muted-foreground">No hay equipos registrados en este criterio</p>
              <Button onClick={handleResetFilters} variant="link" className="mt-2 font-bold text-primary uppercase">
                Restablecer Filtros
              </Button>
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
              <p className="text-lg opacity-90 font-medium">Use nuestro Asistente Inteligente de Logística para recibir recomendaciones personalizadas antes de su compra.</p>
              <Link href="/assistant" className="inline-block">
                <Button variant="secondary" size="lg" className="h-14 px-8 text-lg font-bold bg-white text-primary hover:bg-white/90 uppercase italic tracking-widest shadow-xl">
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
