import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Initialize the Mercado Pago client
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});

export async function POST(request) {
  try {
    const { plan } = await request.json();
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET);
    const userId = decoded.sub;
    const userEmail = decoded.email;

    const preferenceData = {
      items: [
        {
          title: 'Plano Pro',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: 10,
        },
      ],
      payer: {
        email: userEmail,
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/main/dashboard`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      },
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
      external_reference: userId,
    };

    const preference = new Preference(client);
    const response = await preference.create({ body: preferenceData });

    return NextResponse.json({ id: response.id });
  } catch (error) {
    console.error('Error creating preference:', error);
    // It's helpful to log the specific MP error if available
    if (error.response) {
      console.error('Mercado Pago Error:', error.response.data);
    }
    return NextResponse.json({ error: 'Failed to create preference' }, { status: 500 });
  }
}
