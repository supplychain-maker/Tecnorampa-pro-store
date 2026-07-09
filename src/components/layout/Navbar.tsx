"use client"

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, X, User as UserIcon, LogOut, Settings, ShieldAlert, PackageCheck, ClipboardList, LayoutGrid, Truck } from 'lucide-react';
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
          <Link href="/" className="flex items-center gap-2">
            {logo ? (
              <Image 
                src={logo.imageUrl} 
                alt="Tecnorampa Logo" 
                width={200} 
                height={60} 
                className="h-12 w-auto object-contain"
                priority
                unoptimized
              />
            ) : (
              <span className="text-2xl font-black tracking-tighter text-primary">TECNORAMPA</span>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-primary font-bold uppercase tracking-tight text-foreground">Inicio</Link>
            <Link href="/products" className="transition-colors hover:text-primary font-bold uppercase tracking-tight text-foreground">Productos</Link>
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
              <Button variant="ghost" size="icon" className="relative hover:bg-muted">
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

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="text-foreground" /> : <Menu className="text-foreground" />}
          </Button>
        </div>
      </div>
    </nav>
  );
}
