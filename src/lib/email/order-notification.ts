import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generatePickupVoucherPdf } from '@/lib/pdf/pickup-voucher';

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
  customerNotificationSent?: boolean;
  customerNotificationSentAt?: any;
}

/**
 * Genera la plantilla HTML y de texto plano para el correo INTERNO de notificación a Supply Chain.
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
    : 'https://tecnorampa.com.mx/admin/sales';

  const dateStr = new Date().toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
    dateStyle: 'full',
    timeStyle: 'medium'
  });

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
                      TECNORAMPA PRO-STORE • CONTROL INTERNO DE VENTAS
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
                Se ha confirmado un nuevo pedido pagado con tarjeta a través de <strong>Stripe</strong> en la tienda oficial. Se adjunta el <strong>Vale Oficial de Recolección en PDF</strong> correspondiente.
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
                      <tr>
                        <td style="font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Vale PDF Adjunto:</td>
                        <td style="font-size: 12px; font-weight: 700; color: #059669;">
                          📄 Vale-Recoleccion-Tecnorampa-${shortOrderId}.pdf
                        </td>
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
              Este es un correo automático generado por el sistema de pagos de <strong>Tecnorampa Pro-Store</strong>.<br/>
              Notificación oficial dirigida a <strong>supplychain@tecnorampa.com.mx</strong> para inventario y logística.<br/>
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

  const itemsText = items.map(i => ` - ${i.name}${i.variant ? ` [${i.variant}]` : ''} x${i.quantity} @ $${Number(i.price).toLocaleString('es-MX')} MXN`).join('\n');
  const text = `
¡NUEVA VENTA CONFIRMADA Y PAGADA! - TECNORAMPA PRO-STORE
======================================================
Número de Pedido: #${shortOrderId} (${orderId})
Fecha y Hora: ${dateStr}
Estado de Pago: Pagado con Stripe (Completado)
Vale PDF: Adjunto a este mensaje

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
 * Genera la plantilla HTML y de texto plano para el correo que recibe EL CLIENTE (comprobante y vale).
 */
export function buildCustomerConfirmationTemplates(orderId: string, order: OrderData) {
  const shortOrderId = orderId.substring(0, 8).toUpperCase();
  const customerName = order.customerName || 'Estimado(a) Cliente';
  const subtotal = Number(order.subtotal || 0);
  const taxes = Number(order.taxes || subtotal * 0.16);
  const total = Number(order.total || subtotal + taxes);
  const items = order.items || [];
  
  const purchasesUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/my-purchases`
    : 'https://tecnorampa.com.mx/my-purchases';

  const dateStr = new Date().toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
    dateStyle: 'full',
    timeStyle: 'short'
  });

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
  <title>Confirmación de Compra - Tecnorampa</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F3F4F6; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #E5E7EB;" cellspacing="0" cellpadding="0">
          
          <!-- Encabezado Corporativo -->
          <tr>
            <td style="background-color: #111827; padding: 26px 28px; border-bottom: 4px solid #FFD830;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 800; color: #FFD830; letter-spacing: 2px; text-transform: uppercase;">
                      TECNORAMPA PRO-STORE
                    </div>
                    <div style="font-size: 24px; font-weight: 900; color: #FFFFFF; margin-top: 4px; letter-spacing: -0.5px;">
                      ¡Gracias por tu compra!
                    </div>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="background-color: #059669; color: #FFFFFF; font-size: 11px; font-weight: 800; padding: 6px 12px; border-radius: 6px; letter-spacing: 1px; text-transform: uppercase; display: inline-block;">
                      ✓ PAGO RECIBIDO
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Cuerpo Principal -->
          <tr>
            <td style="padding: 28px 28px 16px 28px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">
                Estimado(a) <strong>${customerName}</strong>,<br/>
                Hemos recibido y confirmado tu pago exitosamente. Tu pedido ha sido registrado en nuestro sistema y está listo para programarse para entrega.
              </p>

              <!-- Tarjeta Destacada de Recolección con Código -->
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #111827; border-radius: 10px; margin-bottom: 24px; overflow: hidden; border: 2px solid #FFD830;">
                <tr>
                  <td style="padding: 20px; text-align: center; color: #FFFFFF;">
                    <div style="font-size: 11px; font-weight: 800; color: #FFD830; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px;">
                      TU CÓDIGO OFICIAL DE RECOLECCIÓN EN PLANTA
                    </div>
                    <div style="font-size: 32px; font-weight: 900; letter-spacing: 4px; font-family: monospace; color: #FFFFFF; margin-bottom: 10px;">
                      ${shortOrderId}
                    </div>
                    <div style="font-size: 12px; color: #D1D5DB; line-height: 1.5; max-width: 480px; margin: 0 auto;">
                      📍 <strong>Planta Tecnorampa:</strong> Carr. Federal México - Querétaro km 176+500, El Sauz, Pedro Escobedo, Qro. C.P. 76729<br/>
                      🕒 <strong>Horario de atención:</strong> Lunes a Viernes de 8:30 a 17:30 hrs.<br/>
                      <span style="color: #FFD830; font-size: 11px; font-weight: 600;">* Adjunto a este correo se encuentra tu Vale Oficial en formato PDF para presentar en caseta o almacén.</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Resumen del Pedido -->
              <div style="font-size: 12px; font-weight: 800; color: #111827; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                Resumen de Equipos y Refacciones:
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

              <!-- Totales -->
              <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td width="50%"></td>
                  <td width="50%">
                    <table width="100%" cellspacing="0" cellpadding="6" style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px;">
                      <tr>
                        <td style="font-size: 12px; color: #6B7280; font-weight: 600;">Subtotal:</td>
                        <td align="right" style="font-size: 13px; color: #374151; font-weight: 600;">$${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #6B7280; font-weight: 600;">IVA (16%):</td>
                        <td align="right" style="font-size: 13px; color: #374151; font-weight: 600;">$${taxes.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</td>
                      </tr>
                      <tr style="border-top: 2px solid #E5E7EB;">
                        <td style="font-size: 14px; color: #111827; font-weight: 900; text-transform: uppercase;">Total Pagado:</td>
                        <td align="right" style="font-size: 16px; color: #047857; font-weight: 900;">$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Información de Facturación y Embarque -->
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <div style="font-size: 12px; font-weight: 800; color: #92400E; text-transform: uppercase; margin-bottom: 4px;">
                      📄 ¿Requieres Factura Fiscal (CFDI)?
                    </div>
                    <div style="font-size: 12px; color: #78350F; line-height: 1.5;">
                      Para emitir tu factura con validez fiscal, por favor comparte tu <strong>Constancia de Situación Fiscal</strong> actualizada y el folio de tu orden <strong>(#${shortOrderId})</strong> por WhatsApp al <strong>427 276 1410</strong> o al correo <a href="mailto:supplychain@tecnorampa.com.mx" style="color: #92400E; font-weight: 700;">supplychain@tecnorampa.com.mx</a>.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Botón Mis Compras -->
              <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <a href="${purchasesUrl}" style="background-color: #111827; color: #FFD830; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-size: 13px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; display: inline-block; border: 2px solid #FFD830;">
                      📦 Consultar Mis Compras en Tecnorampa →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Pie de Página -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 20px 28px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #6B7280; line-height: 1.5; text-align: center;">
              Tecnorampa S.A. de C.V. • Especialistas en Rampas Niveladoras y Equipamiento para Andén.<br/>
              Carretera Federal México - Querétaro km 176+500, El Sauz, Pedro Escobedo, Qro. C.P. 76729<br/>
              Teléfono de atención: 800 6230 332 • WhatsApp: 427 276 1410 • <a href="https://tecnorampa.com.mx" style="color: #6B7280;">www.tecnorampa.com.mx</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const itemsText = items.map(i => ` - ${i.name}${i.variant ? ` [${i.variant}]` : ''} x${i.quantity} @ $${Number(i.price).toLocaleString('es-MX')} MXN`).join('\n');
  const text = `
¡GRACIAS POR TU COMPRA EN TECNORAMPA PRO-STORE!
==============================================
Estimado(a) ${customerName},
Tu pago ha sido confirmado satisfactoriamente por Stripe.

CÓDIGO OFICIAL DE RECOLECCIÓN EN PLANTA:
${shortOrderId}

Lugar de Entrega:
Planta Tecnorampa: Carr. Federal México-Querétaro km 176+500, El Sauz, Pedro Escobedo, Qro. C.P. 76729
Horario: Lunes a Viernes de 8:30 a 17:30 hrs.
* Adjunto encontrarás tu Vale de Recolección oficial en PDF con código QR.

RESUMEN DE TU PEDIDO:
${itemsText}

- Subtotal: $${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
- IVA (16%): $${taxes.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
- TOTAL PAGADO: $${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN

SOLICITUD DE FACTURA (CFDI):
Envía tu Constancia de Situación Fiscal y número de orden #${shortOrderId} por WhatsApp al 427 276 1410 o al correo supplychain@tecnorampa.com.mx.

Consulta tus pedidos en cualquier momento:
${purchasesUrl}

Tecnorampa S.A. de C.V.
  `.trim();

  return { html, text, subject: `✅ Confirmación de Compra y Vale de Recolección #${shortOrderId} - Tecnorampa` };
}

/**
 * Función principal para despachar las notificaciones por correo al confirmarse una venta:
 * 1) Correo de control interno a supplychain@tecnorampa.com.mx (con Vale PDF adjunto)
 * 2) Correo de confirmación y entrega al CLIENTE (con Vale PDF adjunto)
 * 
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

    // Comprobación de idempotencia: si ya se envió todo y no se fuerza reenvío, omitir
    if (order.notificationSent && order.customerNotificationSent && !options?.force) {
      console.log(`[NOTIFICACIÓN VENTA] La orden ${orderId} ya fue notificada previamente a logística y cliente. Omitiendo.`);
      return { success: true, skipped: true, reason: 'Already sent' };
    }

    const shortOrderId = orderId.substring(0, 8).toUpperCase();

    // ------------------------------------------------------------------------
    // GENERAR VALE DE RECOLECCIÓN EN PDF
    // ------------------------------------------------------------------------
    let pdfBuffer: Buffer | null = null;
    try {
      pdfBuffer = await generatePickupVoucherPdf(orderId, order);
      console.log(`[NOTIFICACIÓN VENTA] Vale PDF generado con éxito para orden #${shortOrderId} (${pdfBuffer.length} bytes)`);
    } catch (pdfErr: any) {
      console.error('[NOTIFICACIÓN VENTA] Error al generar Vale PDF:', pdfErr.message);
    }

    const pdfAttachment = pdfBuffer ? [{
      filename: `Vale-Recoleccion-Tecnorampa-${shortOrderId}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    }] : [];

    const supplyChainEmail = buildSaleEmailTemplates(orderId, order);
    const customerEmail = buildCustomerConfirmationTemplates(orderId, order);

    const recipientCustomer = order.customerEmail;
    let methodUsed = 'none';
    let supplyChainMessageId: string | undefined;
    let customerMessageId: string | undefined;
    let errorDetail: string | undefined;

    // ------------------------------------------------------------------------
    // MÉTODO 1: SMTP / Nodemailer (Google Workspace / Gmail / cPanel)
    // ------------------------------------------------------------------------
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
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

        // 1. Enviar correo a Supply Chain (Logística interna)
        const infoSupply = await transporter.sendMail({
          from: fromAddress,
          to: NOTIFICATION_RECIPIENT,
          subject: supplyChainEmail.subject,
          html: supplyChainEmail.html,
          text: supplyChainEmail.text,
          attachments: pdfAttachment
        });
        supplyChainMessageId = infoSupply.messageId;
        console.log(`[NOTIFICACIÓN VENTA] Correo y Vale PDF enviados a Supply Chain (${NOTIFICATION_RECIPIENT}) - ID: ${supplyChainMessageId}`);

        // 2. Enviar correo al CLIENTE (si tiene correo válido y no es idéntico al de supplychain para evitar reenvío innecesario si es el mismo)
        if (recipientCustomer) {
          try {
            const infoCustomer = await transporter.sendMail({
              from: fromAddress,
              to: recipientCustomer,
              subject: customerEmail.subject,
              html: customerEmail.html,
              text: customerEmail.text,
              attachments: pdfAttachment
            });
            customerMessageId = infoCustomer.messageId;
            console.log(`[NOTIFICACIÓN VENTA] Correo de confirmación y Vale PDF enviados al Cliente (${recipientCustomer}) - ID: ${customerMessageId}`);
          } catch (custMailErr: any) {
            console.error(`[NOTIFICACIÓN VENTA] Error enviando correo al cliente (${recipientCustomer}):`, custMailErr.message);
            errorDetail = `Cliente: ${custMailErr.message}`;
          }
        } else {
          console.warn(`[NOTIFICACIÓN VENTA] La orden ${orderId} no cuenta con correo de cliente registrado.`);
        }

        methodUsed = 'smtp';
      } catch (err: any) {
        console.error('[NOTIFICACIÓN VENTA] Error enviando vía SMTP:', err.message);
        errorDetail = errorDetail ? `${errorDetail} | SMTP: ${err.message}` : `SMTP: ${err.message}`;
      }
    }

    // ------------------------------------------------------------------------
    // MÉTODO 2: Resend (Alternativa si SMTP no está configurado)
    // ------------------------------------------------------------------------
    if (methodUsed === 'none' && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromAddress = process.env.RESEND_FROM || 'Tecnorampa Pro-Store <ventas@tecnorampa.com.mx>';
        
        const resendAttachments = pdfBuffer ? [{
          filename: `Vale-Recoleccion-Tecnorampa-${shortOrderId}.pdf`,
          content: pdfBuffer
        }] : undefined;

        // A Supply Chain
        const resultSupply = await resend.emails.send({
          from: fromAddress,
          to: NOTIFICATION_RECIPIENT,
          subject: supplyChainEmail.subject,
          html: supplyChainEmail.html,
          text: supplyChainEmail.text,
          attachments: resendAttachments
        });
        supplyChainMessageId = resultSupply.data?.id;

        // Al Cliente
        if (recipientCustomer) {
          const resultCust = await resend.emails.send({
            from: fromAddress,
            to: recipientCustomer,
            subject: customerEmail.subject,
            html: customerEmail.html,
            text: customerEmail.text,
            attachments: resendAttachments
          });
          customerMessageId = resultCust.data?.id;
        }

        methodUsed = 'resend';
      } catch (err: any) {
        console.error('[NOTIFICACIÓN VENTA] Error enviando vía Resend:', err.message);
        errorDetail = `Resend: ${err.message}`;
      }
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
          customerNotificationSent: !!customerMessageId,
          customerNotificationSentTo: recipientCustomer || null,
          customerNotificationSentAt: customerMessageId ? serverTimestamp() : null,
          notificationMethod: methodUsed,
          pickupVoucherGenerated: !!pdfBuffer,
          ...(errorDetail ? { notificationError: errorDetail } : {})
        });
      } catch (updateErr: any) {
        console.warn('[NOTIFICACIÓN VENTA] Error al marcar orden como notificada en Firestore:', updateErr.message);
      }
    }

    return {
      success: true,
      method: methodUsed,
      supplyChainMessageId,
      customerMessageId,
      customerRecipient: recipientCustomer,
      pdfGenerated: !!pdfBuffer,
      error: errorDetail
    };
  } catch (err: any) {
    console.error('[NOTIFICACIÓN VENTA] Error general al procesar notificación:', err);
    return { success: false, error: err.message };
  }
}
