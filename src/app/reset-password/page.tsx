'use client';

import { useState } from 'react';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Correo Enviado",
        description: "Revise su bandeja de entrada para restablecer su contraseña."
      });
      setEmail('');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No pudimos enviar el correo. Verifique la dirección e intente de nuevo."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white industrial-grid p-6">
      <Link href="/login" className="mb-8 flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors uppercase text-xs font-black tracking-widest">
        <ArrowLeft size={16} /> Volver al Acceso
      </Link>

      <Card className="w-full max-w-md border-border shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-muted rounded-full">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-black uppercase italic tracking-tighter">Recuperar Acceso</CardTitle>
          <CardDescription className="text-xs font-bold uppercase tracking-widest pt-2">
            Le enviaremos un enlace seguro para generar una nueva contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="uppercase text-[10px] font-black tracking-widest text-muted-foreground">Correo Registrado</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="ejemplo@empresa.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="h-12"
              />
            </div>
            <Button type="submit" className="w-full font-black uppercase tracking-widest h-12" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Mail className="mr-2" />}
              ENVIAR ENLACE SEGURO
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-muted/30 p-6 flex justify-center">
          <p className="text-[10px] text-muted-foreground text-center font-medium italic">
            Si no recibe el correo en unos minutos, revise su carpeta de spam o contacte a soporte técnico.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
