
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Endpoint seguro para verificar la configuración de Stripe.
 * Detecta si la llave es de prueba o de producción basado en el prefijo oficial.
 */
export async function GET() {
  const secretKey = process.env.STRIPE_SECRET_KEY || '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Verificación de seguridad básica sin exponer la llave completa
  const isConfigured = secretKey.length > 20;
  const isLive = secretKey.startsWith('sk_live');
  const isTest = secretKey.startsWith('sk_test');

  const status = {
    configured: isConfigured,
    mode: isLive ? 'live' : (isTest ? 'test' : 'error'),
    webhookConfigured: !!webhookSecret,
    keyPrefix: secretKey.substring(0, 7), // Útil para diagnóstico sin riesgo
  };

  return NextResponse.json(status);
}
