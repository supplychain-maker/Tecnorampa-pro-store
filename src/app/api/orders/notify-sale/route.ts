import { NextResponse } from 'next/server';
import { sendSaleNotification } from '@/lib/email/order-notification';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { orderId, force } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'orderId es requerido' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Base de datos no inicializada' }, { status: 500 });
    }

    const orderRef = doc(db, 'orders', orderId);
    const snap = await getDoc(orderRef);

    if (!snap.exists()) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    const orderData = { id: snap.id, ...snap.data() } as any;

    // Asegurar que el estado esté como pagado si viene de la confirmación
    if (orderData.status !== 'paid') {
      await updateDoc(orderRef, {
        status: 'paid',
        paymentStatus: 'completed',
        updatedAt: serverTimestamp()
      });
    }

    const result = await sendSaleNotification(orderId, { orderData, force: !!force });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error en API notify-sale:', error);
    return NextResponse.json({ error: error.message || 'Error al procesar notificación' }, { status: 500 });
  }
}
