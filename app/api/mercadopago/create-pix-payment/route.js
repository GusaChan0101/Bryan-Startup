import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { v4 as uuidv4 } from 'uuid';

// Initialize the Mercado Pago client
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});

export async function POST(request) {
  try {
    const { plan } = await request.json(); // Expect 'pro' for now
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET);
    const userId = decoded.sub;
    const userEmail = decoded.email;

    const payment = new Payment(client);
    const idempotencyKey = uuidv4();

    const paymentData = {
      body: {
        transaction_amount: 10.00, // One-time payment for Pro plan
        description: 'Mindeiro Pro - 1 Mês',
        payment_method_id: 'pix',
        payer: {
          email: userEmail,
        },
        external_reference: userId, // Crucial for the webhook
      },
      requestOptions: {
        idempotencyKey: idempotencyKey,
      }
    };

    const result = await payment.create(paymentData);

    const pixData = {
      qr_code_base64: result.point_of_interaction.transaction_data.qr_code_base64,
      qr_code: result.point_of_interaction.transaction_data.qr_code,
    };

    return NextResponse.json(pixData);

  } catch (error) {
    console.error('Error creating PIX payment:', error);
    if (error.response) {
      console.error('Mercado Pago Error:', error.response.data);
    }
    return NextResponse.json({ error: 'Failed to create PIX payment' }, { status: 500 });
  }
}
