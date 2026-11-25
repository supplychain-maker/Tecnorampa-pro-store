import { config } from 'dotenv';
config();
import { buildSaleEmailTemplates, NOTIFICATION_RECIPIENT } from '../src/lib/email/order-notification';

async function testNotification() {
  console.log('Testing Sale Notification Email Template...');
  console.log('Recipient:', NOTIFICATION_RECIPIENT);

  const mockOrder = {
    id: 'test-order-abc12345',
    customerName: 'Constructora Industrial del Bajío S.A. de C.V.',
    customerEmail: 'compras@bajio-constructora.com',
    items: [
      {
        id: 'resorte-extension-amarillo-rampa',
        name: 'Resorte de Extensión Amarillo',
        quantity: 2,
        price: 2450,
        variant: 'ASTM A401 Cromo-Silicio'
      },
      {
        id: 'valvula-reguladora-caudal-parker',
        name: 'Válvula Reguladora de Caudal Parker',
        quantity: 1,
        price: 3890,
        variant: '3/8" NPT Industrial'
      }
    ],
    subtotal: 8790,
    taxes: 1406.4,
    total: 10196.4,
    status: 'paid',
    paymentStatus: 'completed',
    stripeSessionId: 'cs_test_a1b2c3d4e5f6g7h8i9j0',
    pickupLocation: 'Planta Pedro Escobedo, Querétaro (LAB planta)'
  };

  const { html, text, subject } = buildSaleEmailTemplates('test-order-abc12345', mockOrder);

  console.log('Generated Subject:', subject);
  console.log('\n--- TEXT PREVIEW ---');
  console.log(text);
  console.log('\n--- HTML LENGTH ---');
  console.log('HTML characters:', html.length);

  // Validate critical contents
  if (!html.includes('supplychain@tecnorampa.com.mx')) {
    throw new Error('Missing recipient in HTML footer');
  }
  if (!html.includes('Resorte de Extensión Amarillo')) {
    throw new Error('Missing product name in HTML');
  }
  if (!html.includes('10,196.40')) {
    throw new Error('Missing formatted total in HTML');
  }
  if (!html.includes('Constructora Industrial del Bajío')) {
    throw new Error('Missing customer name in HTML');
  }

  console.log('\n✅ ALL EMAIL TEMPLATE ASSERTIONS PASSED!');
}

testNotification().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

