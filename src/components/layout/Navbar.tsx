"use client"

import Link from 'next/link';
import Image from 'next/image';
import { 
  ShoppingCart, 
  Menu, 
  X, 
  User as UserIcon, 
  LogOut, 
  Settings, 
  ShieldAlert, 
  PackageCheck, 
  LayoutGrid, 
  Truck,
  LogIn,
  Home,
  ShoppingBag,
  Building2,
  Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useUser, useAuth, useDoc } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { itemCount } = useCart();
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const [isOpen, setIsOpen] = useState(false);
  
  const userDocRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(userDocRef);
  const isAdmin = profile?.role === 'admin';
  
  const logo = PlaceHolderImages.find(img => img.id === 'company-logo');

  const handleLogout = async () => {
    if (auth) await signOut(auth);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 print:hidden">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link 
            href="/" 
            onClick={() => {
              setIsOpen(false);
              if (typeof window !== 'undefined') {
                sessionStorage.removeItem('home_scroll_pos');
                sessionStorage.removeItem('navigated_to_product');
                window.scrollTo({ top: 0, behavior: 'instant' });
              }
            }}
            className="flex items-center gap-2"
          >
            <Image 
              src={logo?.imageUrl || "/images/tecnorampa-logo.png"} 
              alt="Tecnorampa Logo" 
              width={200} 
              height={60} 
              className="h-12 w-auto object-contain"
              priority
              unoptimized
            />
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link 
              href="/" 
              onClick={() => {
                if (typeof window !== 'undefined') {
                  sessionStorage.removeItem('home_scroll_pos');
                  sessionStorage.removeItem('navigated_to_product');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }
              }}
              className="transition-colors hover:text-primary font-bold uppercase tracking-tight text-foreground"
            >
              Inicio
            </Link>
            <Link 
              href="/products" 
              onClick={() => {
                if (typeof window !== 'undefined') {
                  sessionStorage.removeItem('products_scroll_pos');
                  sessionStorage.removeItem('navigated_to_product');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }
              }}
              className="transition-colors hover:text-primary font-bold uppercase tracking-tight text-foreground"
            >
              Productos
            </Link>
            <Link href="/about" className="transition-colors hover:text-primary font-bold uppercase tracking-tight text-foreground">Nosotros</Link>
            <Link href="/assistant" className="transition-colors hover:text-primary font-bold uppercase tracking-tight text-foreground">Asistente IA</Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full overflow-hidden border border-border">
                  {user.photoURL ? (
                    <Image src={user.photoURL} alt={user.email || ''} width={32} height={32} />
                  ) : (
                    <UserIcon size={20} />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'Usuario'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    {isAdmin && <Badge variant="destructive" className="mt-1 text-[8px] h-4">Administrador</Badge>}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/my-purchases" className="cursor-pointer font-bold">
                    <PackageCheck className="mr-2 h-4 w-4 text-primary" />
                    Mis Compras
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-2 py-1">ADMINISTRACIÓN</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/deliveries" className="cursor-pointer font-bold">
                        <Truck className="mr-2 h-4 w-4 text-primary" />
                        Entregas
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/categories" className="cursor-pointer font-bold">
                        <LayoutGrid className="mr-2 h-4 w-4 text-blue-600" />
                        Grupos Industriales
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/products" className="cursor-pointer text-primary font-bold">
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        Gestión de Catálogo
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Mi Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className="hidden md:block">
              <Button variant="ghost" size="sm" className="font-bold uppercase text-[10px] tracking-widest">
                Ingresar
              </Button>
            </Link>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-muted" aria-label="Carrito de compras">
                <ShoppingCart className="w-5 h-5 text-foreground" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]" variant="default">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md bg-white border-l border-border p-0">
              <CartDrawer />
            </SheetContent>
          </Sheet>

          {/* Botón de Menú Móvil */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Abrir menú de navegación"
          >
            {isOpen ? <X className="text-foreground w-6 h-6" /> : <Menu className="text-foreground w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Menú Móvil Desplegable */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-white shadow-2xl animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="container mx-auto px-4 py-5 flex flex-col space-y-4">
            {/* Navegación Principal */}
            <div className="flex flex-col space-y-1">
              <Link 
                href="/" 
                onClick={() => {
                  setIsOpen(false);
                  if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('home_scroll_pos');
                    sessionStorage.removeItem('navigated_to_product');
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }
                }}
                className="flex items-center gap-3 py-3 px-3 rounded-lg text-sm font-black uppercase tracking-wider text-foreground hover:bg-muted hover:text-primary transition-all border-b border-border/40"
              >
                <Home size={18} className="text-primary" />
                Inicio
              </Link>
              <Link 
                href="/products" 
                onClick={() => {
                  setIsOpen(false);
                  if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('products_scroll_pos');
                    sessionStorage.removeItem('navigated_to_product');
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }
                }}
                className="flex items-center gap-3 py-3 px-3 rounded-lg text-sm font-black uppercase tracking-wider text-foreground hover:bg-muted hover:text-primary transition-all border-b border-border/40"
              >
                <ShoppingBag size={18} className="text-primary" />
                Catálogo de Productos
              </Link>
              <Link 
                href="/about" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 py-3 px-3 rounded-lg text-sm font-black uppercase tracking-wider text-foreground hover:bg-muted hover:text-primary transition-all border-b border-border/40"
              >
                <Building2 size={18} className="text-primary" />
                Nosotros
              </Link>
              <Link 
                href="/assistant" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 py-3 px-3 rounded-lg text-sm font-black uppercase tracking-wider text-foreground hover:bg-muted hover:text-primary transition-all border-b border-border/40"
              >
                <Bot size={18} className="text-primary" />
                Asistente IA
              </Link>
            </div>

            {/* Sección de Usuario / Cuenta en Móvil */}
            {user ? (
              <div className="pt-2 border-t border-border flex flex-col space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/60 rounded-xl border border-border/60">
                  {user.photoURL ? (
                    <Image src={user.photoURL} alt={user.email || ''} width={38} height={38} className="rounded-full border border-border" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      <UserIcon size={20} />
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-bold truncate leading-tight">{user.displayName || 'Usuario'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    {isAdmin && <Badge variant="destructive" className="mt-1 text-[8px] h-4 w-fit uppercase font-black tracking-wider">Administrador</Badge>}
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <Link 
                    href="/my-purchases" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted font-bold text-sm text-foreground transition-colors"
                  >
                    <PackageCheck className="h-4 w-4 text-primary" />
                    Mis Compras
                  </Link>

                  {isAdmin && (
                    <div className="pt-2 pb-1 border-t border-border/60 flex flex-col space-y-1">
                      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-3 py-1">
                        PANEL DE ADMINISTRACIÓN
                      </span>
                      <Link 
                        href="/admin/deliveries" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted font-bold text-sm text-foreground transition-colors"
                      >
                        <Truck className="h-4 w-4 text-primary" />
                        Entregas y Validación QR
                      </Link>
                      <Link 
                        href="/admin/categories" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted font-bold text-sm text-foreground transition-colors"
                      >
                        <LayoutGrid className="h-4 w-4 text-blue-600" />
                        Grupos Industriales
                      </Link>
                      <Link 
                        href="/admin/products" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted font-bold text-sm text-primary transition-colors"
                      >
                        <ShieldAlert className="h-4 w-4" />
                        Gestión de Catálogo
                      </Link>
                    </div>
                  )}

                  <Link 
                    href="/profile" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted font-bold text-sm text-foreground transition-colors"
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    Mi Perfil
                  </Link>

                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-destructive/10 font-bold text-sm text-destructive text-left w-full transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-border">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button className="w-full h-12 font-black uppercase tracking-widest text-xs italic shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground">
                    <LogIn className="mr-2 h-4 w-4" />
                    Ingresar / Iniciar Sesión
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
