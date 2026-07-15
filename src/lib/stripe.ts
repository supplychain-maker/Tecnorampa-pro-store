
import Stripe from 'stripe';

/**
 * Inicialización segura de Stripe.
 * Se utiliza una versión de API estable (2024-12-18.acacia) para garantizar compatibilidad
 * con la mayoría de las cuentas de Stripe.
 */
const stripeKey = process.env.STRIPE_SECRET_KEY || '';

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2024-12-18.acacia' as any,
  appInfo: {
    name: 'Tecnorampa Pro-Store',
    version: '1.0.0',
  },
});
