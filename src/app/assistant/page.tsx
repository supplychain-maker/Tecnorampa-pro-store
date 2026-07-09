"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { aiLogisticsAssistantRecommendation, AILogisticsAssistantRecommendationOutput } from '@/ai/flows/ai-logistics-assistant-recommendation';
import { Loader2, Sparkles, Send, Info, CheckCircle2, Factory } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function AssistantPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AILogisticsAssistantRecommendationOutput | null>(null);
  const [query, setQuery] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await aiLogisticsAssistantRecommendation({ userQuery: query });
      setResult(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-20 industrial-grid min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl">
        <header className="mb-12 text-center">
          <Badge className="bg-primary text-primary-foreground mb-4">TECNORAMPA AI-ASSIST</Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4">Consultoría Inteligente</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Describe el problema que tienes en tu andén o almacén y nuestra IA te recomendará la solución técnica ideal.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Input Area */}
          <div className="lg:col-span-5">
            <Card className="border-border bg-card/80 backdrop-blur shadow-xl border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl italic uppercase tracking-tight">
                  <Sparkles className="text-primary w-5 h-5" />
                  Diagnóstico Industrial
                </CardTitle>
                <CardDescription>Explica tu necesidad o situación operativa actual.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="query" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Descripción del Problema</Label>
                    <Textarea 
                      id="query" 
                      placeholder="Ej: Tengo problemas de visibilidad nocturna dentro de los remolques y los choferes golpean mucho los muros al estacionarse..." 
                      className="min-h-[180px] text-base border-border focus:border-primary resize-none"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-14 font-black uppercase tracking-widest text-xs italic shadow-lg" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                    OBTENER RECOMENDACIÓN TÉCNICA
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border flex items-start gap-4">
              <Info className="text-primary shrink-0 mt-1" size={20} />
              <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                Nuestro asistente analiza miles de configuraciones logísticas para sugerir componentes que cumplan con normativas de seguridad y eficiencia industrial.
              </p>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-7">
            {!result && !loading ? (
              <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-12 text-center text-muted-foreground bg-white/40">
                <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-6 rotate-3">
                  <Factory size={40} className="opacity-40" />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-3 uppercase tracking-tighter italic">Centro de Ingeniería</h3>
                <p className="max-w-xs mx-auto text-sm font-medium">Introduce los detalles de tu operación a la izquierda para generar una propuesta de equipo.</p>
              </div>
            ) : loading ? (
              <div className="h-full flex flex-col items-center justify-center border border-border rounded-xl p-12 text-center space-y-8 bg-card shadow-inner">
                <div className="relative">
                  <div className="w-28 h-28 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto text-primary animate-pulse" size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter">Procesando Solución...</h3>
                  <p className="text-muted-foreground font-bold text-xs uppercase tracking-[0.2em]">Seleccionando componentes de alto rendimiento</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Alert className="bg-primary/10 border-primary/30">
                  <Info className="h-4 w-4 text-primary" />
                  <AlertTitle className="font-black text-primary uppercase text-xs tracking-widest">Propuesta Técnica Optimizada</AlertTitle>
                  <AlertDescription className="text-muted-foreground text-[10px] font-bold uppercase tracking-tight">
                    Configuración basada en estándares de seguridad Tecnorampa S.A. de C.V.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 gap-4">
                  {result.recommendations.map((item, i) => (
                    <Card key={i} className="border-border hover:border-primary/50 transition-colors shadow-sm overflow-hidden">
                      <div className="bg-muted/30 px-6 py-3 border-b flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{item.category}</span>
                        <CheckCircle2 size={16} className="text-green-600" />
                      </div>
                      <CardContent className="pt-6">
                        <h4 className="text-lg font-black uppercase italic mb-3">{item.name}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.technicalJustification}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="border-border bg-card shadow-lg border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs uppercase tracking-[0.2em] font-black text-primary italic">Resumen del Especialista</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-foreground font-medium">
                      {result.explanation}
                    </p>
                  </CardContent>
                </Card>
                
                <div className="flex flex-wrap justify-end gap-4 pt-4">
                  <Button variant="outline" onClick={() => setResult(null)} className="font-bold uppercase text-[10px] tracking-widest h-12 px-8">Nueva Consulta</Button>
                  <Button onClick={() => window.print()} className="font-bold uppercase text-[10px] tracking-widest h-12 px-8 bg-foreground hover:bg-foreground/90">Exportar Propuesta PDF</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
