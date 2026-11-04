
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product, ProductVariant } from '@/app/lib/products';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Loader2, Save, X, Plus, Trash2, LayoutGrid, Info, Tag, ImageIcon, Settings2, FileText, Clock, Boxes, Minus, Zap, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { getDirectImageUrl } from '@/lib/utils';

interface ProductFormProps {
  initialData?: Product;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const catsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), orderBy('name', 'asc'));
  }, [db]);
  const { data: categories, loading: catsLoading } = useCollection(catsQuery);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    slug: '',
    categoryIds: [],
    categoryNames: [],
    price: 0,
    description: '',
    shortDescription: '',
    image: '',
    images: [],
    benefits: [],
    specs: {},
    operationSteps: [],
    variants: [],
    active: true,
    ...(initialData || {}),
    stock: initialData?.stock ?? 0,
    deliveryTime: initialData?.deliveryTime || '3 a 5 días hábiles'
  });

  const [newBenefit, setNewBenefit] = useState('');
  const [newStep, setNewStep] = useState('');
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  
  // State para variantes
  const [varName, setVarName] = useState('');
  const [varPrice, setVarPrice] = useState(0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setLoading(true);

    const productData = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock ?? 0),
      deliveryTime: (formData.deliveryTime || '').trim() || '3 a 5 días hábiles',
      updatedAt: serverTimestamp(),
      ...(initialData ? {} : { createdAt: serverTimestamp() })
    };

    const action = initialData 
      ? updateDoc(doc(db, 'products', initialData.id!), productData)
      : addDoc(collection(db, 'products'), productData);

    action
      .then(() => {
        toast({ title: "Guardado", description: "El catálogo ha sido actualizado correctamente." });
        router.push('/admin/products');
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: initialData ? `products/${initialData.id}` : 'products',
          operation: initialData ? 'update' : 'create',
          requestResourceData: productData
        }));
      })
      .finally(() => setLoading(false));
  };

  const handleCategoryToggle = (catId: string, catName: string) => {
    const currentIds = formData.categoryIds || [];
    const currentNames = formData.categoryNames || [];

    if (currentIds.includes(catId)) {
      setFormData({
        ...formData,
        categoryIds: currentIds.filter(id => id !== catId),
        categoryNames: currentNames.filter(name => name !== catName)
      });
    } else {
      setFormData({
        ...formData,
        categoryIds: [...currentIds, catId],
        categoryNames: [...currentNames, catName]
      });
    }
  };

  const addItem = (field: 'benefits' | 'operationSteps' | 'images', value: string, setter: (v: string) => void) => {
    if (!value.trim()) return;
    setFormData(prev => ({ ...prev, [field]: [...(prev[field] as string[] || []), value] }));
    setter('');
  };

  const removeItem = (field: 'benefits' | 'operationSteps' | 'images', index: number) => {
    setFormData(prev => ({ ...prev, [field]: (prev[field] as string[]).filter((_, i) => i !== index) }));
  };

  const addSpec = () => {
    if (!specKey.trim() || !specValue.trim()) return;
    setFormData(prev => ({ ...prev, specs: { ...(prev.specs || {}), [specKey]: specValue } }));
    setSpecKey('');
    setSpecValue('');
  };

  const removeSpec = (key: string) => {
    const newSpecs = { ...formData.specs };
    delete newSpecs[key];
    setFormData(prev => ({ ...prev, specs: newSpecs }));
  };

  const addVariant = () => {
    if (!varName.trim()) return;
    const newVar: ProductVariant = {
      id: Math.random().toString(36).substr(2, 9),
      name: varName,
      priceModifier: varPrice
    };
    setFormData(prev => ({ ...prev, variants: [...(prev.variants || []), newVar] }));
    setVarName('');
    setVarPrice(0);
  };

  const removeVariant = (id: string) => {
    setFormData(prev => ({ ...prev, variants: (prev.variants || []).filter(v => v.id !== id) }));
  };

  return (
    <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
      <div className="lg:col-span-8 space-y-8">
        <Card className="border-border shadow-lg">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] italic flex items-center gap-2">
              <Info size={16} className="text-primary" /> Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nombre del Producto</Label>
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Niveladora Hidráulica de 30k lbs"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Slug (URL)</Label>
                <Input 
                  value={formData.slug} 
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="ej-niveladora-hidraulica"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Grupos / Categorías (Múltiple)</Label>
                <Link href="/admin/categories" className="text-[9px] font-bold text-primary hover:underline uppercase">Gestionar Grupos</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-muted/30 rounded-lg border border-border">
                {catsLoading ? (
                  <div className="col-span-full py-4 flex justify-center"><Loader2 className="animate-spin h-4 w-4" /></div>
                ) : categories.length === 0 ? (
                  <p className="col-span-full text-[10px] text-muted-foreground italic text-center">No hay grupos creados</p>
                ) : (
                  categories.map((cat: any) => (
                    <div key={cat.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`cat-${cat.id}`} 
                        checked={formData.categoryIds?.includes(cat.id)}
                        onCheckedChange={() => handleCategoryToggle(cat.id, cat.name)}
                      />
                      <label 
                        htmlFor={`cat-${cat.id}`} 
                        className="text-[10px] font-bold uppercase cursor-pointer select-none truncate"
                      >
                        {cat.name}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Precio Base (MXN)</Label>
                <Input 
                  type="number"
                  value={formData.price} 
                  onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="95000"
                  required
                />
              </div>
            </div>

            {/* Gestión de Stock y Tiempo de Entrega */}
            <div className="p-6 bg-primary/5 rounded-xl border border-primary/20 space-y-5">
              <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                <div className="flex items-center gap-2">
                  <Boxes size={18} className="text-primary" />
                  <h4 className="font-black uppercase text-xs tracking-wider italic text-foreground">
                    Inventario y Logística de Entrega
                  </h4>
                </div>
                {(formData.stock ?? 0) > 0 ? (
                  <Badge className="bg-emerald-600/10 text-emerald-600 border-emerald-600/20 font-black text-[9px] uppercase tracking-widest">
                    <Zap size={10} className="mr-1 inline" /> Entrega Inmediata
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-600/30 bg-amber-500/5 font-black text-[9px] uppercase tracking-widest">
                    <Clock size={10} className="mr-1 inline" /> Bajo Pedido / Fabricación
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contador de Stock */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      Unidades en Stock Físico
                    </Label>
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {(formData.stock ?? 0) > 0 ? (
                        <span className="text-emerald-600 font-black">{formData.stock} disp. inmediata</span>
                      ) : (
                        <span className="text-amber-600 font-bold">0 en almacén</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      className="h-11 w-11 shrink-0 font-bold hover:bg-muted"
                      onClick={() => setFormData(prev => ({ ...prev, stock: Math.max(0, (Number(prev.stock) || 0) - 1) }))}
                    >
                      <Minus size={16} />
                    </Button>
                    <Input 
                      type="number"
                      min="0"
                      value={formData.stock ?? 0} 
                      onChange={e => setFormData({ ...formData, stock: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="text-center font-black text-xl h-11"
                      required
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      className="h-11 w-11 shrink-0 font-bold hover:bg-muted"
                      onClick={() => setFormData(prev => ({ ...prev, stock: (Number(prev.stock) || 0) + 1 }))}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Si hay <strong>1 o más unidades</strong> en stock, en la tienda aparecerá automáticamente como <strong>Entrega Inmediata</strong>.
                  </p>
                </div>

                {/* Tiempo de Entrega */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Clock size={12} className="text-primary" /> Tiempo de Entrega (Sin stock o pedidos excedentes)
                  </Label>
                  <Input 
                    value={formData.deliveryTime || ''} 
                    onChange={e => setFormData({ ...formData, deliveryTime: e.target.value })}
                    placeholder="Ej: 3 a 5 días hábiles"
                    className="h-11 font-bold text-xs"
                    required
                  />
                  {/* Presets rápidos */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['3 a 5 días hábiles', '5 a 7 días hábiles', '1 a 2 semanas', '15 a 20 días hábiles', 'Inmediata'].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, deliveryTime: preset }))}
                        className={`text-[9px] px-2.5 py-1 rounded border transition-colors font-bold uppercase ${formData.deliveryTime === preset ? 'bg-primary text-primary-foreground border-primary font-black' : 'bg-background hover:bg-muted text-muted-foreground border-border'}`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Explicación de la regla de visualización al cliente */}
              <div className="bg-background/90 p-3.5 rounded-lg border border-border text-[10px] text-muted-foreground leading-relaxed flex items-start gap-2.5">
                <AlertCircle size={15} className="text-primary shrink-0 mt-0.5" />
                <p>
                  <strong>Regla de compra múltiple:</strong> Si en stock hay 2 unidades y el cliente selecciona 4, la tienda le mostrará automáticamente que <strong>2 unidades tienen entrega inmediata</strong> y que las <strong>2 unidades restantes</strong> se suministrarán en un tiempo de <strong>{formData.deliveryTime || '3 a 5 días hábiles'}</strong>.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Descripción Corta</Label>
              <Input 
                value={formData.shortDescription} 
                onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="Resumen para la tarjeta de producto"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Descripción Detallada</Label>
              <Textarea 
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Explicación técnica completa..."
                className="min-h-[120px]"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Variantes de Configuración */}
        <Card className="border-border shadow-lg">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] italic flex items-center gap-2">
              <Settings2 size={16} className="text-primary" /> Variantes de Configuración
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 space-y-6">
            <div className="bg-muted/20 p-6 rounded-xl border border-dashed border-border">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Añadir nueva opción de configuración</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest">Nombre de Variante (Ej: 40k lbs - Labio 18")</Label>
                  <Input 
                    value={varName} 
                    onChange={e => setVarName(e.target.value)} 
                    placeholder="Capacidad / Medida / Modelo"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest">Cargo Adicional (MXN)</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      value={varPrice} 
                      onChange={e => setVarPrice(Number(e.target.value))} 
                      placeholder="0"
                    />
                    <Button type="button" onClick={addVariant} variant="secondary">
                      <Plus size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {(formData.variants || []).map((v) => (
                <div key={v.id} className="flex justify-between items-center p-4 bg-white border border-border rounded-lg shadow-sm hover:border-primary/30 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-black uppercase text-xs italic">{v.name}</span>
                    <span className="text-[10px] font-bold text-primary">Cargo extra: +${v.priceModifier.toLocaleString()}</span>
                  </div>
                  <Button type="button" size="icon" variant="ghost" onClick={() => removeVariant(v.id)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
              {(!formData.variants || formData.variants.length === 0) && (
                <p className="text-center py-6 text-xs text-muted-foreground italic">No hay variantes configuradas para este equipo.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-lg">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] italic flex items-center gap-2">
              <ImageIcon size={16} className="text-primary" /> Galería de Imágenes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 space-y-6">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Añadir Imagen a Galería</Label>
              <div className="flex gap-2">
                <Input 
                  value={newImageUrl} 
                  onChange={e => setNewImageUrl(e.target.value)} 
                  placeholder="URL de Drive o Directa" 
                />
                <Button type="button" onClick={() => addItem('images', newImageUrl, setNewImageUrl)} variant="secondary">
                  <Plus size={18} />
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {formData.images?.map((url, i) => (
                  <div key={i} className="relative aspect-square bg-muted rounded-lg border border-border group overflow-hidden">
                    <Image 
                      src={getDirectImageUrl(url)} 
                      alt={`Vista ${i+1}`} 
                      fill 
                      className="object-cover" 
                      unoptimized 
                    />
                    <button 
                      type="button"
                      onClick={() => removeItem('images', i)}
                      className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ficha Técnica (PDF) */}
        <Card className="border-border shadow-lg">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] italic flex items-center gap-2">
              <FileText size={16} className="text-primary" /> Ficha Técnica Oficial (PDF)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Ruta del PDF o Enlace Directo (Opcional)
              </Label>
              <Input 
                value={formData.technicalSheetUrl || ''} 
                onChange={e => setFormData({ ...formData, technicalSheetUrl: e.target.value })} 
                placeholder={`/fichas-tecnicas/${formData.slug || 'nombre-producto'}.pdf`} 
              />
              <p className="text-[10px] text-muted-foreground font-medium">
                Por defecto, el sistema asocia automáticamente el archivo ubicado en la carpeta <code>fichas-tecnicas/{`{slug}`}.pdf</code>.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-lg">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] italic flex items-center gap-2">
              <LayoutGrid size={16} className="text-primary" /> Especificaciones y Beneficios
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 space-y-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Beneficios Clave</Label>
              <div className="flex gap-2">
                <Input value={newBenefit} onChange={e => setNewBenefit(e.target.value)} placeholder="Ej: Pintura electrostática" />
                <Button type="button" onClick={() => addItem('benefits', newBenefit, setNewBenefit)} variant="secondary">
                  <Plus size={18} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.benefits?.map((benefit, i) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1 flex items-center gap-2 font-bold uppercase text-[9px]">
                    {benefit}
                    <X size={12} className="cursor-pointer" onClick={() => removeItem('benefits', i)} />
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Especificaciones Técnicas</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input value={specKey} onChange={e => setSpecKey(e.target.value)} placeholder="Característica" />
                <div className="flex gap-2">
                  <Input value={specValue} onChange={e => setSpecValue(e.target.value)} placeholder="Valor" />
                  <Button type="button" onClick={addSpec} variant="secondary">
                    <Plus size={18} />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(formData.specs || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-3 bg-muted rounded border border-border">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase text-muted-foreground">{key}</span>
                      <span className="text-sm font-bold">{value as string}</span>
                    </div>
                    <Button type="button" size="icon" variant="ghost" onClick={() => removeSpec(key)} className="h-8 w-8 text-destructive">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-4 space-y-8">
        <Card className="border-border shadow-lg">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] italic flex items-center gap-2">
              <Tag size={16} className="text-primary" /> Multimedia y Estado
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">URL Imagen Portada</Label>
              <Input 
                value={formData.image} 
                onChange={e => setFormData({ ...formData, image: e.target.value })}
                placeholder="URL de imagen principal"
                required
              />
              {formData.image && (
                <div className="relative aspect-video rounded border overflow-hidden mt-2">
                  <Image src={getDirectImageUrl(formData.image)} alt="Portada" fill className="object-cover" unoptimized />
                </div>
              )}
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="active" 
                  checked={formData.active} 
                  onCheckedChange={checked => setFormData({ ...formData, active: !!checked })}
                />
                <Label htmlFor="active" className="font-bold uppercase text-xs italic cursor-pointer">Producto Visible</Label>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex flex-col gap-3">
              <Button type="submit" className="h-14 font-black uppercase tracking-widest text-xs italic w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                {initialData ? 'ACTUALIZAR EQUIPO' : 'REGISTRAR PRODUCTO'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} className="h-12 font-bold uppercase tracking-widest text-[10px] w-full">
                <X className="mr-2 h-4 w-4" /> CANCELAR
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
