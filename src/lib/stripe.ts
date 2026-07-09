
import Stripe from 'stripe';

/**
 * Inicialización segura de Stripe.
 * Las llaves se manejan exclusivamente por variables de entorno.
 */
const stripeKey = process.env.STRIPE_SECRET_KEY || '';

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2025-01-27-acacia' as any,
  appInfo: {
    name: 'Tecnorampa Pro-Store',
    version: '1.0.0',
  },
});
