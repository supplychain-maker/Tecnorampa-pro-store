'use client';

import { useState } from 'react';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  FileCheck2, 
  Eye, 
  Printer, 
  Sparkles,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/app/lib/products';

interface ProductTechnicalSheetProps {
  product: Product;
  currentVariantName?: string;
}

export function ProductTechnicalSheet({ product, currentVariantName }: ProductTechnicalSheetProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'specs'>('preview');
  const [previewType, setPreviewType] = useState<'sheets' | 'iframe'>('sheets');
  const [activeSheet, setActiveSheet] = useState<number>(1);

  // URL de la ficha técnica: personalizada o derivada automáticamente por slug
  const pdfUrl = product.technicalSheetUrl || `/fichas-tecnicas/${product.slug}.pdf`;
  const downloadFileName = `Ficha-Tecnica-Tecnorampa-${product.slug}.pdf`;

  // Láminas en alta definición generadas para vista directa sin dependencias de plugins PDF
  const hasSheetImages = {
    p1: `/fichas-tecnicas/${product.slug}-pag1.png`,
    p2: `/fichas-tecnicas/${product.slug}-pag2.png`,
  };

  const handlePrint = () => {
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Herramientas y Acciones de la Ficha Técnica */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-card border-2 border-border rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <FileText size={26} />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-black uppercase tracking-wider text-sm italic">
                Ficha Técnica Oficial de Ingeniería
              </span>
              <Badge variant="secondary" className="bg-primary/15 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/30">
                PDF OFICIAL
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Documento técnico con tolerancias, diagrama, especificaciones certificadas y normas ISO/UL/ANSI.
            </p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            asChild
            size="sm"
            className="h-10 px-4 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs italic shadow-md hover:bg-primary/90"
          >
            <a href={pdfUrl} download={downloadFileName} target="_blank" rel="noopener noreferrer">
              <Download size={15} className="mr-2" /> Descargar PDF
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-10 px-3.5 border-2 font-black uppercase tracking-widest text-xs italic hover:bg-muted"
          >
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={15} className="mr-1.5" /> Abrir en Pestaña
            </a>
          </Button>
        </div>
      </div>

      {/* Selector de Vista: Láminas HD vs Visor PDF vs Tabla */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={viewMode === 'preview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('preview')}
            className={`h-8 text-xs font-black uppercase tracking-wider italic ${viewMode === 'preview' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            <Sparkles size={14} className="mr-1.5" /> Ficha Técnica Oficial (HD)
          </Button>
          <Button
            variant={viewMode === 'specs' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('specs')}
            className={`h-8 text-xs font-black uppercase tracking-wider italic ${viewMode === 'specs' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            <Layers size={14} className="mr-1.5" /> Datos Técnicos en Tabla
          </Button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase">
          <ShieldCheck size={14} className="text-primary" />
          <span>Certificación Tecnorampa Querétaro</span>
        </div>
      </div>

      {/* Contenido según el modo seleccionado */}
      {viewMode === 'preview' ? (
        <div className="space-y-4">
          {/* Sub-barra para cambiar entre Láminas HD y Visor Embebido */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/40 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground italic mr-1">
                Modo de Visualización:
              </span>
              <button
                type="button"
                onClick={() => setPreviewType('sheets')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider italic transition-all ${
                  previewType === 'sheets'
                    ? 'bg-card text-foreground border-2 border-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Láminas Oficiales (2 Páginas)
              </button>
              <button
                type="button"
                onClick={() => setPreviewType('iframe')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider italic transition-all ${
                  previewType === 'iframe'
                    ? 'bg-card text-foreground border-2 border-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Visor PDF Interactivo
              </button>
            </div>

            {previewType === 'sheets' && (
              <div className="flex items-center gap-1.5 bg-background p-1 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setActiveSheet(1)}
                  className={`px-2.5 py-1 rounded text-[11px] font-black uppercase tracking-wider transition-all ${
                    activeSheet === 1
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Pág 1: {product.slug.includes('poleas') ? 'Propiedades Mecánicas' : (product.slug.includes('tope') ? 'Catálogo' : 'Ficha Técnica')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSheet(2)}
                  className={`px-2.5 py-1 rounded text-[11px] font-black uppercase tracking-wider transition-all ${
                    activeSheet === 2
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Pág 2: {product.slug.includes('poleas') ? 'Compresión e Impacto' : (product.slug.includes('tope') ? 'Plano Ortográfico' : 'Página 2')}
                </button>
              </div>
            )}
          </div>

          {/* Renderizado de Láminas HD o Visor PDF */}
          {previewType === 'sheets' ? (
            <div className="relative w-full rounded-2xl overflow-hidden border-2 border-border bg-white shadow-xl p-2 md:p-6 flex flex-col items-center">
              <div className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-border">
                <img
                  src={activeSheet === 1 ? hasSheetImages.p1 : hasSheetImages.p2}
                  alt={`Ficha Técnica ${product.name} - Página ${activeSheet}`}
                  className="w-full h-auto object-contain select-none"
                  loading="eager"
                />
              </div>

              {/* Botones de cambio de página inferiores */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveSheet(1)}
                  disabled={activeSheet === 1}
                  className="font-black uppercase tracking-wider text-xs italic"
                >
                  Anterior: Pág. 1 (Catálogo)
                </Button>
                <span className="text-xs font-black uppercase tracking-widest text-primary italic">
                  Página {activeSheet} de 2
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveSheet(2)}
                  disabled={activeSheet === 2}
                  className="font-black uppercase tracking-wider text-xs italic"
                >
                  Siguiente: Pág. 2 (Plano)
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative w-full rounded-2xl overflow-hidden border-2 border-border bg-muted/30 shadow-lg">
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0&view=FitH`}
                title={`Ficha Técnica - ${product.name}`}
                className="w-full h-[620px] md:h-[780px] bg-white border-0"
                loading="lazy"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-muted/40 rounded-xl border border-border text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              <FileCheck2 size={15} className="text-primary shrink-0" />
              Documento oficial de ingeniería emitido por Tecnorampa S.A. de C.V.
            </span>
            <a
              href={pdfUrl}
              download={downloadFileName}
              className="text-primary font-black uppercase tracking-wider hover:underline flex items-center gap-1 shrink-0 italic"
            >
              <Download size={14} /> Descarga Directa (.PDF)
            </a>
          </div>
        </div>
      ) : (
        /* Vista de Tabla de Especificaciones Clásica */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4 max-w-5xl py-2">
          {Object.entries(product.specs || {}).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center py-4 border-b border-border">
              <span className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">{key}</span>
              <span className="font-bold text-sm">{String(value)}</span>
            </div>
          ))}
          {currentVariantName && (
            <div className="flex justify-between items-center py-4 border-b-2 border-primary bg-primary/5 px-4 rounded-t-lg">
              <span className="text-primary font-black uppercase text-[10px] tracking-widest">Variante Seleccionada</span>
              <span className="font-black text-sm text-primary uppercase italic">{currentVariantName}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
