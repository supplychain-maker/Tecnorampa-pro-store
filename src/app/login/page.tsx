'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { LogIn, UserPlus, ShieldCheck, Chrome, Loader2, ArrowLeft, Building2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function LoginContent() {
  const auth = useAuth();
  const db = useFirestore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const initialMode = searchParams.get('mode') === 'signup' ? false : true;
  const redirect = searchParams.get('redirect') || '/';

  const [isLogin, setIsLogin] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Acceso Exitoso", description: "Bienvenido de nuevo a Tecnorampa." });
        router.push(redirect);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: `${firstName} ${lastName}` });
        
        const userDocRef = doc(db, 'users', user.uid);
        const userData = {
          firstName,
          lastName,
          email: user.email,
          company,
          role: 'customer',
          createdAt: serverTimestamp(),
          uid: user.uid
        };

        setDoc(userDocRef, userData)
          .catch(async () => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: userDocRef.path,
              operation: 'create',
              requestResourceData: userData
            }));
          });

        toast({ title: "Cuenta Creada", description: "Ya puede gestionar sus pedidos industriales." });
        router.push(redirect);
      }
    } catch (error: any) {
      console.error("Auth Error:", error.code);
      if (error.code === 'auth/operation-not-allowed') {
        setErrorMessage("¡FALTA ACTIVAR EL PROVEEDOR! En tu consola de Firebase, haz clic en 'Agregar proveedor nuevo' y selecciona 'Correo electrónico/contraseña'.");
      } else {
        setErrorMessage(error.message || "Error al procesar la solicitud.");
      }
      toast({ 
        variant: "destructive", 
        title: "Error de Acceso", 
        description: error.message || "Verifique sus credenciales e intente de nuevo." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth || !db) return;
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      setErrorMessage(null);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const [fName = '', ...lNameParts] = (user.displayName || '').split(' ');
      const lName = lNameParts.join(' ');

      const userData = {
        firstName: fName,
        lastName: lName,
        email: user.email,
        uid: user.uid,
        role: 'customer'
      };

      setDoc(userDocRef, userData, { merge: true })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'write',
            requestResourceData: userData
          }));
        });

      router.push(redirect);
    } catch (error: any) {
      setErrorMessage("Error al iniciar con Google. Asegúrate de que el popup no esté bloqueado.");
      toast({ variant: "destructive", title: "Error", description: "Error al iniciar con Google." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center bg-white industrial-grid p-6">
      <Link href="/" className="mb-12 flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors uppercase text-xs font-black tracking-[0.25em]">
        <ArrowLeft size={16} /> Volver a la Tienda
      </Link>
      
      <Card className="w-full max-w-md border-border shadow-2xl bg-white/95 backdrop-blur-xl border-t-8 border-t-primary">
        <CardHeader className="space-y-2 pt-10">
          <div className="flex justify-center mb-8">
            <div className="p-5 bg-primary rounded-2xl shadow-xl shadow-primary/20 rotate-3">
              <Building2 className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-4xl font-black text-center uppercase tracking-tighter italic">
            {isLogin ? 'Acceso Cliente' : 'Registro Corporativo'}
          </CardTitle>
          <CardDescription className="text-center font-bold text-muted-foreground uppercase text-[10px] tracking-widest pt-2">
            {isLogin 
              ? 'Identifíquese para continuar su operación' 
              : 'Únase a nuestra red logística certificada'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Configuración Requerida</AlertTitle>
              <AlertDescription className="text-xs font-bold">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="uppercase text-[10px] font-black tracking-widest text-muted-foreground">Nombre</Label>
                    <Input 
                      id="firstName" 
                      placeholder="Juan" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required={!isLogin}
                      className="h-12 border-border focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="uppercase text-[10px] font-black tracking-widest text-muted-foreground">Apellido</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Pérez" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required={!isLogin}
                      className="h-12 border-border focus:border-primary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="uppercase text-[10px] font-black tracking-widest text-muted-foreground">Empresa</Label>
                  <Input 
                    id="company" 
                    placeholder="Logística Industrial S.A." 
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required={!isLogin}
                    className="h-12 border-border focus:border-primary"
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="uppercase text-[10px] font-black tracking-widest text-muted-foreground">Correo Corporativo</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="ejemplo@empresa.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="h-12 border-border focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" title="Contraseña" className="uppercase text-[10px] font-black tracking-widest text-muted-foreground">Contraseña</Label>
                {isLogin && (
                  <Link href="/reset-password" size="sm" className="text-[10px] text-primary font-bold hover:underline">
                    ¿Olvidó su contraseña?
                  </Link>
                )}
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="h-12 border-border focus:border-primary"
              />
            </div>
            <Button type="submit" className="w-full font-black h-14 text-lg shadow-xl uppercase tracking-tighter italic" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : (isLogin ? <LogIn className="mr-2" /> : <UserPlus className="mr-2" />)}
              {isLogin ? 'INGRESAR AL SISTEMA' : 'CREAR MI CUENTA'}
            </Button>
          </form>
          
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black">
              <span className="bg-white px-4 text-muted-foreground tracking-[0.3em]">O continuar con</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full h-12 font-black border-border hover:bg-muted transition-all uppercase text-[10px] tracking-widest" onClick={handleGoogleLogin} disabled={loading}>
            <Chrome className="mr-3 h-4 w-4 text-primary" />
            CUENTA DE GOOGLE (Habilitada)
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-6 border-t border-border mt-6 p-8 bg-muted/10">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] text-primary font-black hover:underline uppercase tracking-widest"
          >
            {isLogin ? '¿No tiene cuenta corporativa? Regístrese aquí' : '¿Ya es cliente Tecnorampa? Inicie sesión'}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
