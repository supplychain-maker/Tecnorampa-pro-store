'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { User, Building2, Phone, MapPin, Save, Loader2, ShieldCheck, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function ProfilePage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const userDocRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile, loading: profileLoading } = useDoc(userDocRef);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    address: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        company: profile.company || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
    }
  }, [profile]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDocRef) return;
    setSaving(true);

    const updateData = {
      ...formData,
      updatedAt: serverTimestamp()
    };

    updateDoc(userDocRef, updateData)
      .then(() => {
        toast({ title: "Perfil Actualizado", description: "Sus datos corporativos han sido guardados." });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'update',
          requestResourceData: updateData
        }));
      })
      .finally(() => {
        setSaving(false);
      });
  };

  return (
    <div className="py-20 industrial-grid min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <header className="mb-12">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic border-l-8 border-primary pl-6">Perfil Corporativo</h1>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-2 ml-8">Gestión de datos de cliente Tecnorampa</p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          <Card className="border-border shadow-xl">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg rotate-3 shrink-0">
                  <User size={32} />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-xl font-black uppercase tracking-tight italic truncate">
                    {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : (user.displayName || 'Usuario')}
                  </CardTitle>
                  <CardDescription className="font-medium flex items-center gap-2">
                    <Mail size={12} /> {user.email}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <User size={12} className="text-primary" /> Nombre
                    </Label>
                    <Input 
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                      placeholder="Nombre"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <User size={12} className="text-primary" /> Apellido
                    </Label>
                    <Input 
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                      placeholder="Apellido"
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <Building2 size={12} className="text-primary" /> Empresa / Razón Social
                    </Label>
                    <Input 
                      value={formData.company}
                      onChange={e => setFormData({...formData, company: e.target.value})}
                      placeholder="Nombre de la empresa"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <Phone size={12} className="text-primary" /> Teléfono Corporativo
                    </Label>
                    <Input 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="+52 000 000 0000"
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <MapPin size={12} className="text-primary" /> Dirección Fiscal / Planta
                  </Label>
                  <Input 
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    placeholder="Calle, Ciudad, Estado, CP"
                    className="h-12"
                  />
                </div>

                <div className="pt-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2 opacity-50">
                    <ShieldCheck size={16} className="text-green-600" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Datos Encriptados y Seguros</span>
                  </div>
                  <Button type="submit" className="w-full sm:w-auto font-black uppercase tracking-widest px-12 h-14 italic" disabled={saving}>
                    {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                    GUARDAR CAMBIOS
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
