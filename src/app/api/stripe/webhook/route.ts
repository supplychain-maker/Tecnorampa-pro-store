
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Webhook de Stripe para confirmación asíncrona de pagos.
 * Este es el corazón de la resiliencia: actualiza la orden incluso si el usuario cierra el navegador.
 */
export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error(`Error de firma en Webhook: ${err.message}`);
    return NextResponse.json({ error: 'Firma de Webhook inválida.' }, { status: 400 });
  }

  // Solo procesamos el evento de pago exitoso
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const orderId = session.metadata?.orderId;

    if (orderId && db) {
      try {
        const orderRef = doc(db, 'orders', orderId);
        // Cambiamos el estado de 'pending' a 'paid' únicamente tras confirmación de Stripe
        await updateDoc(orderRef, {
          status: 'paid',
          paymentStatus: 'completed',
          stripeSessionId: session.id,
          updatedAt: serverTimestamp()
        });
        console.log(`Orden ${orderId} confirmada como PAGADA satisfactoriamente.`);
      } catch (dbError) {
        console.error('Error al actualizar Firestore desde Webhook:', dbError);
      }
    }
  }

  return NextResponse.json({ received: true });
}
