
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { getDirectImageUrl } from '@/lib/utils';

/**
 * Crea una sesión de pago segura en Stripe (Producción).
 * Calcula el monto incluyendo el 16% de IVA y maneja la redirección.
 */
export async function POST(req: Request) {
  try {
    const { items, userEmail, userId, orderId } = await req.json();
    const headersList = await headers();
    const origin = headersList.get('origin');

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('CRITICAL: STRIPE_SECRET_KEY is missing in environment variables.');
      return NextResponse.json({ error: 'Configuración incompleta: Falta la llave secreta de Stripe.' }, { status: 500 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío.' }, { status: 400 });
    }

    // El cálculo del IVA y centavos se realiza aquí para máxima precisión
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: items.map((item: any) => {
        // Limpiamos la URL de la imagen para Stripe.
        // Stripe requiere URLs públicas. Si no es segura, no la enviamos para evitar que falle el checkout.
        const cleanImage = item.image ? getDirectImageUrl(item.image) : '';
        const stripeImages = (cleanImage && cleanImage.startsWith('https')) ? [cleanImage] : [];
        
        return {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: item.name,
              images: stripeImages,
              description: item.variant ? `Configuración: ${item.variant} (IVA Incluido)` : 'Equipo Industrial Tecnorampa (IVA Incluido)',
            },
            // Stripe requiere el monto en centavos (monto * 1.16 IVA * 100)
            unit_amount: Math.round(Number(item.price) * 1.16 * 100), 
          },
          quantity: item.quantity,
        };
      }),
      mode: 'payment',
      success_url: `${origin}/checkout?success=true&order_id=${orderId}`,
      cancel_url: `${origin}/checkout?canceled=true`,
      metadata: {
        userId,
        orderId,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err: any) {
    console.error('Error detallado de Stripe:', err);
    return NextResponse.json({ 
      error: err.message || 'No se pudo iniciar el proceso de pago.' 
    }, { status: 500 });
  }
}
