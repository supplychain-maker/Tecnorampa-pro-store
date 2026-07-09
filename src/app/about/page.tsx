
"use client"

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Factory, ShieldCheck, Target, Users, MapPin, CheckCircle2, Award, FileCheck } from 'lucide-react';

export default function AboutPage() {
  const factoryImage = PlaceHolderImages.find(img => img.id === 'company-building');
  const qualityImage = PlaceHolderImages.find(img => img.id === 'quality-guarantee-bg');
  const mapImage = PlaceHolderImages.find(img => img.id === 'company-location-map');

  return (
    <div className="flex flex-col bg-background">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src={factoryImage?.imageUrl || 'https://lh3.googleusercontent.com/d/1_Y2pEPJ8uyXAIptUQ7ojmq-oOLi2gbJ-'} 
            alt="Instalaciones Tecnorampa" 
            fill 
            className="object-cover brightness-50"
            priority
            unoptimized
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center space-y-4">
          <Badge className="bg-primary text-primary-foreground font-black px-4 py-1">TECNORAMPA S.A. DE C.V.</Badge>
          <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-none">
            Ingeniería que <br /> <span className="text-primary">impulsa a la industria</span>
          </h1>
        </div>
      </section>

      {/* Quiénes Somos */}
      <section className="py-24 industrial-grid bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic border-l-8 border-primary pl-6">Quiénes Somos</h2>
                <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                  En Tecnorampa somos líderes mexicanos en el diseño, fabricación y comercialización de soluciones para andenes de carga y sistemas de elevación industrial.
                </p>
              </div>
              <div className="space-y-6 text-foreground/80 leading-relaxed">
                <p>
                  Desde nuestras instalaciones estratégicamente ubicadas en <strong>Pedro Escobedo, Querétaro</strong>, transformamos acero en productividad. Nuestra infraestructura nos permite controlar cada etapa del proceso, desde la ingeniería conceptual hasta el ensamble final, garantizando que cada niveladora o rampa cumpla con los estándares más rigurosos de seguridad internacional.
                </p>
                <p>
                  No solo vendemos equipos; entregamos confianza operativa. Entendemos que el andén de carga es el corazón de la logística, y nuestra misión es asegurar que ese corazón nunca deje de latir con eficiencia y seguridad.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><CheckCircle2 className="text-primary" /></div>
                  <span className="font-bold text-sm uppercase tracking-tight">Fabricación Nacional</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><FileCheck className="text-primary" /></div>
                  <span className="font-bold text-sm uppercase tracking-tight">Certificación UL / ISO 9001</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><CheckCircle2 className="text-primary" /></div>
                  <span className="font-bold text-sm uppercase tracking-tight">Normativa ANSI MH30.1</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><CheckCircle2 className="text-primary" /></div>
                  <span className="font-bold text-sm uppercase tracking-tight">Soporte B2B Directo</span>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 bg-primary/20 rounded-2xl rotate-3 group-hover:rotate-1 transition-transform" />
              <div className="relative aspect-square rounded-xl overflow-hidden border-4 border-white shadow-2xl">
                <Image 
                  src={qualityImage?.imageUrl || 'https://lh3.googleusercontent.com/d/1TbDZYrXdoic-RXqv8SAnagJNPCBEu5jE'} 
                  alt="Operación Logística de Calidad" 
                  fill 
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-foreground text-background p-8 rounded-xl shadow-2xl max-w-xs border-b-4 border-primary">
                <p className="text-3xl font-black italic uppercase leading-none mb-2">100%</p>
                <p className="text-xs font-bold uppercase tracking-widest opacity-70">Calidad Industrial Garantizada</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Misión, Visión, Valores */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-xl bg-white/80 backdrop-blur border-t-4 border-t-primary">
              <CardContent className="pt-10 space-y-4">
                <Target className="w-12 h-12 text-primary" />
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Nuestra Misión</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Proveer a la industria de herramientas logísticas de alta gama que maximicen la seguridad del personal y la eficiencia en el movimiento de mercancías, superando las expectativas técnicas de nuestros socios comerciales.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white/80 backdrop-blur border-t-4 border-t-primary">
              <CardContent className="pt-10 space-y-4">
                <Award className="w-12 h-12 text-primary" />
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Nuestra Visión</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Consolidarnos como el fabricante referente en América Latina para equipamiento de andenes, siendo reconocidos por nuestra innovación constante y la durabilidad extrema de nuestros componentes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white/80 backdrop-blur border-t-4 border-t-primary">
              <CardContent className="pt-10 space-y-4">
                <ShieldCheck className="w-12 h-12 text-primary" />
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Nuestros Valores</h3>
                <ul className="text-muted-foreground text-sm space-y-2">
                  <li className="flex items-center gap-2 font-bold text-foreground/80">• Compromiso con la Seguridad</li>
                  <li className="flex items-center gap-2 font-bold text-foreground/80">• Innovación en Ingeniería</li>
                  <li className="flex items-center gap-2 font-bold text-foreground/80">• Integridad en los Materiales</li>
                  <li className="flex items-center gap-2 font-bold text-foreground/80">• Servicio Post-Venta Directo</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Ubicación Planta */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 text-center space-y-12">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">Centro de Manufactura</h2>
            <p className="text-muted-foreground font-medium italic">Visítanos o coordina tu recolección directamente en nuestra planta principal.</p>
          </div>
          
          <div className="bg-muted/50 rounded-2xl p-8 md:p-16 border border-border grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="text-left space-y-6">
              <div className="flex gap-4">
                <MapPin className="text-primary shrink-0" size={32} />
                <div className="space-y-1">
                  <h4 className="font-black uppercase tracking-widest text-xs">Ubicación Estratégica</h4>
                  <p className="text-lg font-bold">
                    Carretera Federal México-Querétaro km 176 + 500<br />
                    El Sauz, Pedro Escobedo, Qro. CP. 76729
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Factory className="text-primary shrink-0" size={32} />
                <div className="space-y-1">
                  <h4 className="font-black uppercase tracking-widest text-xs">Capacidad Industrial</h4>
                  <p className="text-muted-foreground">Más de 5,000 m² dedicados a la transformación de acero y ensamble tecnológico.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Users className="text-primary shrink-0" size={32} />
                <div className="space-y-1">
                  <h4 className="font-black uppercase tracking-widest text-xs">Equipo Humano</h4>
                  <p className="text-muted-foreground">Ingenieros y técnicos certificados apasionados por la logística segura.</p>
                </div>
              </div>
            </div>
            
            <div className="h-96 relative rounded-xl overflow-hidden shadow-2xl border-4 border-white">
              <Image 
                src={mapImage?.imageUrl || 'https://lh3.googleusercontent.com/d/1NX3CwYmcMoQa3o-Izb3X_dONg4THJuSE'} 
                alt="Mapa de Ubicación Tecnorampa" 
                fill 
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-primary/5 hover:bg-transparent transition-colors duration-500" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
