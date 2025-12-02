import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { MercadoPagoConfig, PreApprovalPlan } from 'mercadopago';

// Initialize the Mercado Pago client
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});

export async function POST(request) {
  try {
    const { plan } = await request.json(); // Expect 'pro' for now
    const authHeader = request.headers.get('authorization');
    console.log("Backend - Authorization header received:", authHeader); // Log full auth header

    const token = authHeader?.split(' ')[1];
    console.log("Backend - Extracted token for verification:", token); // Log extracted token

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET);
    const userId = decoded.sub;
    const userEmail = decoded.email;

    const startDate = new Date();
    startDate.setHours(startDate.getHours() + 1); // Set it one hour in the future

    // Define the preapproval plan data
    const planData = {
      body: {
        reason: 'Mindeiro Pro Subscription Plan', // A description for the plan
        external_reference: `mindeiro-pro-sub-${userId}`, // Your internal reference for this plan
        auto_recurring: {
          frequency: 1, // Every 1 unit of frequency_type
          frequency_type: 'months', // Monthly recurring
          transaction_amount: 10.00, // Amount to be charged each period
          currency_id: 'BRL', // Currency code (e.g., BRL, USD, ARS)
          start_date: startDate.toISOString(), // Add start_date
        },
        back_url: `${process.env.NEXT_PUBLIC_APP_URL}/main/dashboard`, // URL to redirect after preapproval
        // Other optional fields can be added here
        payer_email: userEmail,
      },
    };

    const preApprovalPlan = new PreApprovalPlan(client);
    const response = await preApprovalPlan.create(planData);

    // Mercado Pago returns init_point for redirection
    return NextResponse.json({ init_point: response.init_point });

  } catch (error) {
    console.error('Error creating preapproval plan:', error);
    // It's helpful to log the specific MP error if available
    if (error.response) {
      console.error('Mercado Pago Error:', error.response.data);
    }
    return NextResponse.json({ error: 'Failed to create subscription plan' }, { status: 500 });
  }
}
