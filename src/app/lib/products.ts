
export interface ProductVariant {
  id: string;
  name: string;
  priceModifier: number;
}

export interface Product {
  id?: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  image: string;
  images: string[];
  category?: string;
  categoryIds?: string[];
  categoryNames?: string[];
  benefits: string[];
  specs: { [key: string]: string };
  operationSteps: string[];
  variants?: ProductVariant[];
  active?: boolean;
}

/**
 * Se han eliminado los datos estáticos (PRODUCTS array) para utilizar Firestore como única fuente de verdad.
 * Las interfaces se mantienen para tipado en toda la aplicación.
 */
