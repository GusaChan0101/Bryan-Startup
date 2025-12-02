import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import clientPromise from '@/lib/mongodb';

// Initialize the Mercado Pago client
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});

export async function POST(request) {
  const body = await request.json();
  
  if (body.type === 'payment' && body.data && body.data.id) {
    try {
      const paymentClient = new Payment(client);
      const paymentDetails = await paymentClient.get({ id: body.data.id });

      if (paymentDetails) {
        const { status, external_reference } = paymentDetails;
        
        if (status === 'approved' && external_reference) {
          const userId = external_reference;
          
          const dbClient = await clientPromise;
          const db = dbClient.db(process.env.DB_NAME);
          const usersCollection = db.collection('users');

          const renewalDate = new Date();
          renewalDate.setMonth(renewalDate.getMonth() + 1);

          const result = await usersCollection.updateOne(
            { id: userId },
            { 
              $set: { 
                plan: 'pro',
                plan_renewal_date: renewalDate,
                mercadopagoPaymentId: body.data.id
              } 
            }
          );
          
          if (result.modifiedCount === 0) {
            console.error(`Webhook: User with id ${userId} not found or not updated.`);
          } else {
            console.log(`Webhook: User ${userId} updated to pro plan.`);
          }
        }
      }
    } catch (error) {
      console.error('Error handling Mercado Pago webhook:', error);
      if (error.response) {
        console.error('Mercado Pago Error:', error.response.data);
      }
      return NextResponse.json({ error: 'Failed to process payment event' }, { status: 500 });
    }
  }

  // Always return a 200 OK to Mercado Pago to acknowledge receipt of the event
  return NextResponse.json({ received: true });
}