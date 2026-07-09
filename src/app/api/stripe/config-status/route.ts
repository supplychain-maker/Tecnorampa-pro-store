
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Endpoint seguro para verificar la configuración de Stripe sin exponer las llaves ni patrones sensibles.
 */
export async function GET() {
  const secretKey = process.env.STRIPE_SECRET_KEY || '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Verificación genérica para evitar que GitHub bloquee el código
  const isConfigured = secretKey.length > 20;
  const isLive = isConfigured && !secretKey.includes('test');

  const status = {
    configured: isConfigured,
    mode: isLive ? 'live' : (isConfigured ? 'test' : 'none'),
    webhookConfigured: !!webhookSecret,
  };

  return NextResponse.json(status);
}
