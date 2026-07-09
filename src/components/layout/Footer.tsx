import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Linkedin, Facebook, ShieldCheck, FileCheck } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function Footer() {
  const logo = PlaceHolderImages.find(img => img.id === 'company-logo');

  return (
    <footer className="bg-card border-t border-border pt-12 pb-8 print:hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              {logo ? (
                <Image 
                  src={logo.imageUrl} 
                  alt="Tecnorampa Logo" 
                  width={180} 
                  height={50} 
                  className="h-10 w-auto object-contain"
                  unoptimized
                />
              ) : (
                <span className="text-xl font-black tracking-tighter text-primary">TECNORAMPA</span>
              )}
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Líderes en soluciones industriales para andenes de carga. Robustez, seguridad y eficiencia para su operación logística.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin size={20} /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook size={20} /></Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">Sobre Nosotros</Link></li>
              <li><Link href="/products" className="hover:text-primary">Catálogo Pro</Link></li>
              <li><Link href="/assistant" className="hover:text-primary">Asistente IA</Link></li>
              <li><Link href="#" className="hover:text-primary">Contacto</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Certificaciones</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><FileCheck size={14} className="text-primary" /> ISO 9001:2015</li>
              <li className="flex items-center gap-2"><FileCheck size={14} className="text-primary" /> Certificación UL</li>
              <li className="flex items-center gap-2"><FileCheck size={14} className="text-primary" /> Normativa ANSI</li>
              <li className="flex items-center gap-2"><FileCheck size={14} className="text-primary" /> NOM Mexicana</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Contacto Directo</h4>
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <Phone size={18} className="text-primary mt-0.5" />
              <span>+52 427 276 1410</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <Mail size={18} className="text-primary mt-0.5" />
              <span>ventas4@tecnorampa.com.mx</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <MapPin size={18} className="text-primary mt-0.5" />
              <span>
                Carretera Federal México-Querétaro km 176 + 500<br />
                El Sauz, Pedro Escobedo, Qro. CP. 76729
              </span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <p>© {new Date().getFullYear()} Tecnorampa S.A. de C.V. Todos los derechos reservados.</p>
            <Link href="#" className="hover:text-primary underline">Aviso de Privacidad</Link>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-primary" />
            <span>Fabricación y Tecnología Mexicana Certificada (UL / ISO / ANSI)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
