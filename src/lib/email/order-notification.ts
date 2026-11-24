import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const NOTIFICATION_RECIPIENT = process.env.ORDER_NOTIFICATION_EMAIL || 'supplychain@tecnorampa.com.mx';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  variant?: string | null;
}

export interface OrderData {
  id?: string;
  customerName?: string;
  customerEmail?: string;
  items?: OrderItem[];
  subtotal?: number;
  taxes?: number;
  total?: number;
  status?: string;
  paymentStatus?: string;
  stripeSessionId?: string;
  pickupLocation?: string;
  createdAt?: any;
  notificationSent?: boolean;
  notificationSentAt?: any;
}

/**
 * Genera la plantilla HTML y de texto plano para el correo de notificación de venta.
 */
export function buildSaleEmailTemplates(orderId: string, order: OrderData) {
  const shortOrderId = orderId.substring(0, 8).toUpperCase();
  const customerName = order.customerName || 'Cliente Corporativo';
  const customerEmail = order.customerEmail || 'No especificado';
  const subtotal = Number(order.subtotal || 0);
  const taxes = Number(order.taxes || subtotal * 0.16);
  const total = Number(order.total || subtotal + taxes);
  const items = order.items || [];
  const pickup = order.pickupLocation || 'Planta Pedro Escobedo, Querétaro (LAB planta)';
  
  const adminUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/admin/sales`
    : 'https://tecnorampa-pro-store.vercel.app/admin/sales';

  const dateStr = new Date().toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  // Generar filas de productos en HTML
  const itemsHtml = items.map((item, idx) => {
    const itemTotal = Number(item.price || 0) * Number(item.quantity || 1);
    const bgColor = idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
    return `
      <tr style="background-color: ${bgColor};">
        <td style="padding: 12px 14px; border-bottom: 1px solid #E5E7EB; font-size: 13px; color: #111827; font-weight: 600;">
          ${item.name}
          ${item.variant ? `<br/><span style="font-size: 11px; color: #6B7280; font-weight: 500;">Medida / Config: <strong>${item.variant}</strong></span>` : ''}
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #E5E7EB; text-align: center; font-size: 13px; color: #111827; font-weight: 700;">
          x${item.quantity}
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #E5E7EB; text-align: right; font-size: 13px; color: #374151;">
          $${Number(item.price || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #E5E7EB; text-align: right; font-size: 13px; color: #111827; font-weight: 700;">
          $${itemTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
        </td>
      </tr>
    `;
  }).join('');

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notificación de Venta Confirmada</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F3F4F6; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #E5E7EB;" cellspacing="0" cellpadding="0">
          
          <!-- Encabezado Corporativo Tecnorampa -->
          <tr>
            <td style="background-color: #111827; padding: 24px 28px; border-bottom: 4px solid #FFD830;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 10px; font-weight: 800; color: #FFD830; letter-spacing: 2px; text-transform: uppercase;">
                      TECNORAMPA PRO-STORE • SISTEMA DE VENTAS
                    </div>
                    <div style="font-size: 22px; font-weight: 900; color: #FFFFFF; margin-top: 4px; letter-spacing: -0.5px; text-transform: uppercase;">
                      ¡Nueva Venta Confirmada y Pagada!
                    </div>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="background-color: #059669; color: #FFFFFF; font-size: 10px; font-weight: 800; padding: 5px 10px; border-radius: 6px; letter-spacing: 1px; text-transform: uppercase; display: inline-block;">
                      ✓ PAGO STRIPE OK
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Cuerpo Principal -->
          <tr>
            <td style="padding: 28px 28px 16px 28px;">
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.5; color: #374151;">
                Se ha confirmado un nuevo pedido pagado con tarjeta a través de <strong>Stripe</strong> en la tienda oficial. A continuación los detalles para programación logística:
              </p>

              <!-- Tarjeta de Resumen Rápido -->
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <table width="100%" cellspacing="0" cellpadding="4">
                      <tr>
                        <td width="35%" style="font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Número de Pedido:</td>
                        <td style="font-size: 14px; font-weight: 900; color: #111827; font-family: monospace;">#${shortOrderId} <span style="font-size: 11px; color: #9CA3AF; font-weight: 400;">(${orderId})</span></td>
                      </tr>
                      <tr>
                        <td style="font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Fecha y Hora:</td>
                        <td style="font-size: 13px; font-weight: 600; color: #374151;">${dateStr}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Cliente:</td>
                        <td style="font-size: 13px; font-weight: 700; color: #111827;">${customerName}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Correo Contacto:</td>
                        <td style="font-size: 13px; font-weight: 600; color: #2563EB;">
                          <a href="mailto:${customerEmail}" style="color: #2563EB; text-decoration: underline;">${customerEmail}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Ubicación Entrega:</td>
                        <td style="font-size: 13px; font-weight: 600; color: #374151;">${pickup}</td>
                      </tr>
                      ${order.stripeSessionId ? `
                      <tr>
                        <td style="font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Stripe Session ID:</td>
                        <td style="font-size: 11px; font-weight: 600; color: #6B7280; font-family: monospace;">${order.stripeSessionId}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Desglose de Equipos Comprados -->
              <div style="font-size: 12px; font-weight: 800; color: #111827; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                Equipos y Refacciones Solicitadas:
              </div>
              
              <table width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; margin-bottom: 24px; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #111827; color: #FFFFFF;">
                    <th align="left" style="padding: 10px 14px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Producto</th>
                    <th align="center" style="padding: 10px 14px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Cant.</th>
                    <th align="right" style="padding: 10px 14px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">P. Unit.</th>
                    <th align="right" style="padding: 10px 14px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Resumen Financiero -->
              <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td width="50%"></td>
                  <td width="50%">
                    <table width="100%" cellspacing="0" cellpadding="6" style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px;">
                      <tr>
                        <td style="font-size: 12px; color: #6B7280; font-weight: 600;">Subtotal (Neto):</td>
                        <td align="right" style="font-size: 13px; color: #374151; font-weight: 600;">$${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #6B7280; font-weight: 600;">IVA Trasladado (16%):</td>
                        <td align="right" style="font-size: 13px; color: #374151; font-weight: 600;">$${taxes.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</td>
                      </tr>
                      <tr style="border-top: 2px solid #E5E7EB;">
                        <td style="font-size: 14px; color: #111827; font-weight: 900; text-transform: uppercase;">Total Cobrado:</td>
                        <td align="right" style="font-size: 16px; color: #111827; font-weight: 900; color: #047857;">$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Botón de Acción Directa -->
              <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <a href="${adminUrl}" style="background-color: #111827; color: #FFD830; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 13px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; display: inline-block; border: 2px solid #FFD830;">
                      📦 Abrir Pedido en Panel de Ventas Tecnorampa →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Pie de Página -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 20px 28px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #6B7280; line-height: 1.5; text-align: center;">
              Este es un correo automático generado por el sistema de pagos seguros de <strong>Tecnorampa Pro-Store</strong>.<br/>
              Notificación oficial dirigida a <strong>supplychain@tecnorampa.com.mx</strong> para seguimiento de inventario y recolección.<br/>
              Tecnorampa S.A. de C.V. • Planta Pedro Escobedo, Querétaro • Tel: 800 6230 332
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // Versión texto plano
  const itemsText = items.map(i => ` - ${i.name}${i.variant ? ` [${i.variant}]` : ''} x${i.quantity} @ $${Number(i.price).toLocaleString('es-MX')} MXN`).join('\n');
  const text = `
¡NUEVA VENTA CONFIRMADA Y PAGADA! - TECNORAMPA PRO-STORE
======================================================
Número de Pedido: #${shortOrderId} (${orderId})
Fecha y Hora: ${dateStr}
Estado de Pago: Pagado con Stripe (Completado)

DATOS DEL CLIENTE:
- Nombre: ${customerName}
- Correo: ${customerEmail}
- Ubicación de Entrega: ${pickup}

EQUIPOS Y REFACCIONES:
${itemsText}

RESUMEN FINANCIERO:
- Subtotal: $${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
- IVA (16%): $${taxes.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
- TOTAL COBRADO: $${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN

Ver y gestionar en el panel de ventas:
${adminUrl}

Notificación oficial enviada automáticamente a supplychain@tecnorampa.com.mx
Tecnorampa S.A. de C.V.
  `.trim();

  return { html, text, subject: `🛒 [NUEVA VENTA PAGADA] Orden #${shortOrderId} - $${total.toLocaleString('es-MX')} MXN` };
}

/**
 * Función principal para despachar la notificación por correo al confirmarse una venta.
 * Garantiza idempotencia: solo envía una vez por orden, salvo que se use force=true.
 */
export async function sendSaleNotification(orderId: string, options?: { session?: any; orderData?: any; force?: boolean }) {
  if (!orderId) {
    console.error('[NOTIFICACIÓN VENTA] Error: No se proporcionó orderId');
    return { success: false, error: 'Falta orderId' };
  }

  try {
    let order: OrderData | null = options?.orderData || null;
    let orderRef: any = null;

    if (db) {
      orderRef = doc(db, 'orders', orderId);
      if (!order) {
        const snap = await getDoc(orderRef);
        if (snap.exists() && snap.data()) {
          order = { id: snap.id, ...(snap.data() as object) } as OrderData;
        }
      }
    }

    if (!order) {
      console.warn(`[NOTIFICACIÓN VENTA] No se encontró la orden ${orderId} en Firestore; usando datos de sesión.`);
      order = {
        id: orderId,
        customerEmail: options?.session?.customer_details?.email || options?.session?.customer_email,
        customerName: options?.session?.customer_details?.name || 'Cliente Stripe',
        total: (options?.session?.amount_total ? options.session.amount_total / 100 : 0),
        stripeSessionId: options?.session?.id
      };
    }

    // Comprobación de idempotencia: si ya se envió y no se fuerza reenvío, omitir
    if (order.notificationSent && !options?.force) {
      console.log(`[NOTIFICACIÓN VENTA] La orden ${orderId} ya fue notificada previamente a ${order.customerEmail || NOTIFICATION_RECIPIENT}. Omitiendo.`);
      return { success: true, skipped: true, reason: 'Already sent' };
    }

    const { html, text, subject } = buildSaleEmailTemplates(orderId, order);
    let methodUsed = 'none';
    let messageId: string | undefined;
    let errorDetail: string | undefined;

    // ------------------------------------------------------------------------
    // MÉTODO 1: Resend (si existe RESEND_API_KEY)
    // ------------------------------------------------------------------------
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromAddress = process.env.RESEND_FROM || 'Tecnorampa Pro-Store <ventas@tecnorampa.com.mx>';
        const result = await resend.emails.send({
          from: fromAddress,
          to: NOTIFICATION_RECIPIENT,
          subject,
          html,
          text
        });

        if (result.error) {
          throw new Error(result.error.message);
        }
        methodUsed = 'resend';
        messageId = result.data?.id;
        console.log(`[NOTIFICACIÓN VENTA] Correo enviado exitosamente vía Resend a ${NOTIFICATION_RECIPIENT} (ID: ${messageId})`);
      } catch (err: any) {
        console.error('[NOTIFICACIÓN VENTA] Error enviando vía Resend:', err.message);
        errorDetail = `Resend: ${err.message}`;
      }
    }

    // ------------------------------------------------------------------------
    // MÉTODO 2: SMTP / Nodemailer (Google Workspace / Gmail / cPanel)
    // ------------------------------------------------------------------------
    if (methodUsed === 'none' && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const isSecure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465';
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: Number(process.env.SMTP_PORT || (isSecure ? 465 : 587)),
          secure: isSecure,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const fromAddress = process.env.SMTP_FROM || `"Tecnorampa Pro-Store" <${process.env.SMTP_USER}>`;

        const info = await transporter.sendMail({
          from: fromAddress,
          to: NOTIFICATION_RECIPIENT,
          subject,
          html,
          text,
        });

        methodUsed = 'smtp';
        messageId = info.messageId;
        console.log(`[NOTIFICACIÓN VENTA] Correo enviado exitosamente vía SMTP a ${NOTIFICATION_RECIPIENT} (MessageId: ${messageId})`);
      } catch (err: any) {
        console.error('[NOTIFICACIÓN VENTA] Error enviando vía SMTP:', err.message);
        errorDetail = errorDetail ? `${errorDetail} | SMTP: ${err.message}` : `SMTP: ${err.message}`;
      }
    }

    // ------------------------------------------------------------------------
    // MÉTODO 3: Cola de correo en Firestore (Firebase Trigger Email extension)
    // ------------------------------------------------------------------------
    if (db) {
      try {
        await addDoc(collection(db, 'mail'), {
          to: NOTIFICATION_RECIPIENT,
          message: {
            subject,
            text,
            html
          },
          orderId,
          createdAt: serverTimestamp()
        });
        if (methodUsed === 'none') {
          methodUsed = 'firebase-mail-queue';
          console.log(`[NOTIFICACIÓN VENTA] Correo encolado en Firestore colección 'mail' para ${NOTIFICATION_RECIPIENT}`);
        }
      } catch (queueErr: any) {
        console.warn('[NOTIFICACIÓN VENTA] No se pudo encolar en Firestore mail:', queueErr.message);
      }
    }

    // ------------------------------------------------------------------------
    // Si no había credenciales activas, registrar log informativo
    // ------------------------------------------------------------------------
    if (methodUsed === 'none') {
      console.log(`
================================================================================
[NOTIFICACIÓN DE VENTA GENERADA]
Destinatario: ${NOTIFICATION_RECIPIENT}
Asunto: ${subject}
Orden ID: ${orderId}
Monto Total: $${order.total} MXN
Cliente: ${order.customerName} (${order.customerEmail})
Equipos: ${(order.items || []).map(i => `${i.name} x${i.quantity}`).join(', ')}

AVISO DE CONFIGURACIÓN:
Para envío directo a través de servidor de correo, configura en tu archivo .env:
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=465
  SMTP_USER=tu-cuenta@tecnorampa.com.mx
  SMTP_PASS=tu-contraseña-de-aplicación
o bien:
  RESEND_API_KEY=re_...
================================================================================
      `);
      methodUsed = 'console-log';
    }

    // ------------------------------------------------------------------------
    // Actualizar estado de la orden en Firestore
    // ------------------------------------------------------------------------
    if (orderRef) {
      try {
        await updateDoc(orderRef, {
          notificationSent: true,
          notificationSentTo: NOTIFICATION_RECIPIENT,
          notificationSentAt: serverTimestamp(),
          notificationMethod: methodUsed,
          ...(errorDetail ? { notificationError: errorDetail } : {})
        });
      } catch (updateErr: any) {
        console.error('[NOTIFICACIÓN VENTA] Error al marcar orden como notificada:', updateErr.message);
      }
    }

    return {
      success: true,
      method: methodUsed,
      messageId,
      recipient: NOTIFICATION_RECIPIENT,
      error: errorDetail
    };
  } catch (err: any) {
    console.error('[NOTIFICACIÓN VENTA] Error general al procesar notificación:', err);
    return { success: false, error: err.message };
  }
}
