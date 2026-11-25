import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { OrderData } from '@/lib/email/order-notification';

/**
 * Genera el Vale Oficial de Recolección / Entrega en formato PDF como Buffer.
 */
export async function generatePickupVoucherPdf(orderId: string, order: OrderData): Promise<Buffer> {
  const shortOrderId = orderId.substring(0, 8).toUpperCase();
  const customerName = order.customerName || 'Cliente Corporativo';
  const customerEmail = order.customerEmail || 'No especificado';
  const subtotal = Number(order.subtotal || 0);
  const taxes = Number(order.taxes || subtotal * 0.16);
  const total = Number(order.total || subtotal + taxes);
  const items = order.items || [];
  const pickup = order.pickupLocation || 'Planta Pedro Escobedo, Querétaro (LAB planta)';

  const dateStr = new Date().toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Generar código QR en buffer PNG
  const verificationUrl = `https://tecnorampa.com.mx/admin/deliveries?order=${orderId}`;
  const qrBuffer = await QRCode.toBuffer(verificationUrl, {
    width: 140,
    margin: 1,
    color: {
      dark: '#111827',
      light: '#FFFFFF'
    }
  });

  return new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margin: 36,
        info: {
          Title: `Vale de Recolección - Orden #${shortOrderId} - Tecnorampa`,
          Author: 'Tecnorampa S.A. de C.V.',
          Subject: 'Comprobante de compra y vale de entrega en planta',
          Keywords: 'tecnorampa, vale, recoleccion, rampa, niveladora'
        }
      });

      const chunks: Buffer[] = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));

      const pageWidth = 612;
      const margin = 36;
      const contentWidth = pageWidth - margin * 2; // 540

      // ----------------------------------------------------------------------
      // 1. ENCABEZADO CORPORATIVO
      // ----------------------------------------------------------------------
      const headerHeight = 65;
      doc.rect(margin, margin, contentWidth, headerHeight).fill('#111827');
      doc.rect(margin, margin + headerHeight - 3, contentWidth, 3).fill('#FFD830');

      // Intentar cargar logo oficial de Tecnorampa si existe
      const logoPath = path.join(process.cwd(), 'public', 'images', 'tecnorampa-logo.png');
      const hasLogo = fs.existsSync(logoPath);

      if (hasLogo) {
        try {
          doc.image(logoPath, margin + 12, margin + 10, { height: 42 });
        } catch (e) {
          // Fallback a texto
          doc.font('Helvetica-Bold').fontSize(16).fillColor('#FFD830').text('TECNORAMPA', margin + 14, margin + 14);
        }
      } else {
        doc.font('Helvetica-Bold').fontSize(16).fillColor('#FFD830').text('TECNORAMPA', margin + 14, margin + 14);
      }

      // Título del documento
      const textX = hasLogo ? margin + 175 : margin + 140;
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#FFFFFF').text('VALE OFICIAL DE ENTREGA Y RECOLECCIÓN', textX, margin + 16);
      doc.font('Helvetica').fontSize(8.5).fillColor('#9CA3AF').text('PRO-STORE INDUSTRIAL • COMPROBANTE OFICIAL DE PAGO', textX, margin + 34);

      // Badge de estado de pago (Stripe)
      const badgeW = 145;
      const badgeH = 22;
      const badgeX = margin + contentWidth - badgeW - 12;
      const badgeY = margin + 20;
      doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 4).fill('#059669');
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF').text('✓ PAGO STRIPE CONFIRMADO', badgeX, badgeY + 6, {
        width: badgeW,
        align: 'center'
      });

      // ----------------------------------------------------------------------
      // 2. TARJETA DE DATOS DEL PEDIDO Y CLIENTE
      // ----------------------------------------------------------------------
      let curY = margin + headerHeight + 12;
      const cardHeight = 82;
      doc.roundedRect(margin, curY, contentWidth, cardHeight, 6).fillAndStroke('#F9FAFB', '#E5E7EB');

      // Columna Izquierda (Datos Pedido)
      const col1X = margin + 14;
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#6B7280').text('FOLIO DE PEDIDO:', col1X, curY + 10);
      doc.font('Helvetica-Bold').fontSize(13).fillColor('#111827').text(`#${shortOrderId}`, col1X, curY + 20);
      doc.font('Helvetica').fontSize(6.5).fillColor('#9CA3AF').text(`ID: ${orderId}`, col1X, curY + 35);

      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#6B7280').text('FECHA Y HORA:', col1X, curY + 48);
      doc.font('Helvetica').fontSize(8.5).fillColor('#1F2937').text(dateStr, col1X, curY + 59);

      // Columna Derecha (Datos Cliente y Almacén)
      const col2X = margin + 270;
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#6B7280').text('CLIENTE REGISTRADO:', col2X, curY + 10);
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827').text(customerName, col2X, curY + 20);
      doc.font('Helvetica').fontSize(8).fillColor('#2563EB').text(customerEmail, col2X, curY + 34);

      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#6B7280').text('UBICACIÓN DE ENTREGA:', col2X, curY + 48);
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#111827').text('Planta Pedro Escobedo, Querétaro', col2X, curY + 59);
      doc.font('Helvetica').fontSize(7).fillColor('#4B5563').text('Condición: LAB Planta (Libre a Bordo)', col2X, curY + 69);

      // ----------------------------------------------------------------------
      // 3. TABLA DE EQUIPOS / REFACCIONES
      // ----------------------------------------------------------------------
      curY += cardHeight + 14;
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#111827').text('DETALLE DE EQUIPOS Y REFACCIONES AUTORIZADAS:', margin, curY);

      curY += 14;
      const thHeight = 20;
      doc.rect(margin, curY, contentWidth, thHeight).fill('#111827');

      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
      doc.text('EQUIPO / REFACCIÓN', margin + 10, curY + 6);
      doc.text('CANT.', margin + 300, curY + 6, { width: 40, align: 'center' });
      doc.text('P. UNITARIO', margin + 350, curY + 6, { width: 85, align: 'right' });
      doc.text('IMPORTE', margin + 440, curY + 6, { width: 90, align: 'right' });

      curY += thHeight;

      items.forEach((item, idx) => {
        const itemTotal = Number(item.price || 0) * Number(item.quantity || 1);
        const rowHeight = item.variant ? 28 : 22;
        const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB';

        doc.rect(margin, curY, contentWidth, rowHeight).fillAndStroke(rowBg, '#E5E7EB');

        // Nombre y variante
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#111827').text(item.name, margin + 10, curY + 5, { width: 285 });
        if (item.variant) {
          doc.font('Helvetica-Oblique').fontSize(7).fillColor('#6B7280').text(`Especificación: ${item.variant}`, margin + 10, curY + 16, { width: 285 });
        }

        // Cantidad
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#111827').text(`x${item.quantity}`, margin + 300, curY + 6, { width: 40, align: 'center' });

        // Precio Unitario
        doc.font('Helvetica').fontSize(8).fillColor('#374151').text(`$${Number(item.price || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, margin + 350, curY + 6, { width: 85, align: 'right' });

        // Total
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#111827').text(`$${itemTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, margin + 440, curY + 6, { width: 90, align: 'right' });

        curY += rowHeight;
      });

      // ----------------------------------------------------------------------
      // 4. RESUMEN FINANCIERO (Totales)
      // ----------------------------------------------------------------------
      curY += 8;
      const totalsW = 220;
      const totalsX = margin + contentWidth - totalsW;
      const totalsH = 58;

      doc.roundedRect(totalsX, curY, totalsW, totalsH, 5).fillAndStroke('#F9FAFB', '#E5E7EB');

      doc.font('Helvetica').fontSize(8).fillColor('#6B7280').text('Subtotal:', totalsX + 10, curY + 8);
      doc.font('Helvetica').fontSize(8).fillColor('#374151').text(`$${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, totalsX + 70, curY + 8, { width: 140, align: 'right' });

      doc.font('Helvetica').fontSize(8).fillColor('#6B7280').text('IVA Trasladado (16%):', totalsX + 10, curY + 22);
      doc.font('Helvetica').fontSize(8).fillColor('#374151').text(`$${taxes.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, totalsX + 70, curY + 22, { width: 140, align: 'right' });

      doc.rect(totalsX + 10, curY + 36, totalsW - 20, 1).fill('#E5E7EB');

      doc.font('Helvetica-Bold').fontSize(9).fillColor('#111827').text('TOTAL PAGADO:', totalsX + 10, curY + 41);
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#059669').text(`$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, totalsX + 70, curY + 40, { width: 140, align: 'right' });

      curY += totalsH + 14;

      // ----------------------------------------------------------------------
      // 5. CAJA OFICIAL DE RECOLECCIÓN Y QR DE CONTROL
      // ----------------------------------------------------------------------
      const qrBoxH = 110;
      doc.roundedRect(margin, curY, contentWidth, qrBoxH, 8).fillAndStroke('#FFFFFF', '#111827');
      doc.rect(margin, curY, 6, qrBoxH).fill('#FFD830');

      // Imagen QR
      const qrX = margin + 16;
      const qrY = curY + 10;
      doc.image(qrBuffer, qrX, qrY, { width: 90 });

      // Información de recolección al lado del QR
      const infoX = margin + 118;
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#6B7280').text('CÓDIGO OFICIAL PARA RECOLECCIÓN EN PLANTA:', infoX, curY + 12);
      doc.font('Courier-Bold').fontSize(22).fillColor('#111827').text(shortOrderId, infoX, curY + 24);

      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#111827').text('DIRECCIÓN DE ENTREGA (PLANTA TECNORAMPA):', infoX, curY + 54);
      doc.font('Helvetica').fontSize(7.5).fillColor('#374151').text('Carretera Federal México - Querétaro km 176+500, El Sauz, Pedro Escobedo, Qro. C.P. 76729', infoX, curY + 64);
      doc.font('Helvetica-Bold').fontSize(7).fillColor('#059669').text('Horario de recolección: Lunes a Viernes de 8:30 a 17:30 hrs.', infoX, curY + 76);

      doc.font('Helvetica-Oblique').fontSize(6.5).fillColor('#6B7280').text('* Presentar este vale impreso o en pantalla junto con identificación oficial del personal asignado a recolección.', infoX, curY + 90);

      // ----------------------------------------------------------------------
      // 6. PIE DE PÁGINA (FACTURACIÓN, SOPORTE Y CONTACTO)
      // ----------------------------------------------------------------------
      const footerY = 715;
      doc.rect(margin, footerY, contentWidth, 0.5).fill('#D1D5DB');

      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#111827').text('SOLICITUD DE FACTURA (CFDI) Y PROGRAMACIÓN DE EMBARQUE:', margin, footerY + 6);
      doc.font('Helvetica').fontSize(7).fillColor('#4B5563').text(
        'Para emisión de factura fiscal con validez oficial, envíe su Constancia de Situación Fiscal actualizada y número de pedido por WhatsApp al 427 276 1410 o al correo supplychain@tecnorampa.com.mx dentro del mes de compra.',
        margin,
        footerY + 16,
        { width: contentWidth }
      );

      doc.font('Helvetica-Bold').fontSize(7).fillColor('#6B7280').text(
        'Tecnorampa S.A. de C.V.  •  Planta Pedro Escobedo, Qro.  •  Teléfono: 800 6230 332  •  www.tecnorampa.com.mx',
        margin,
        footerY + 36,
        { width: contentWidth, align: 'center' }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

