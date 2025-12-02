import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getUserFromRequest } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

export async function POST(request) {
  console.log("\n--- ✅ CHECKOUT SESSION API HIT ---");
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await request.json();
    console.log(`[1/5] Plan received: ${plan}`);

    // Ensure plan name comparison is case-insensitive
    const priceId = plan?.toLowerCase() === 'pro' ? process.env.STRIPE_PRO_PLAN_PRICE_ID : null;
    console.log(`[2/5] Stripe Price ID being used: ${priceId}`);

    const secretKey = process.env.STRIPE_SECRET_KEY;
    console.log(`[3/5] Stripe Secret Key loaded: ${secretKey ? `sk_...${secretKey.slice(-4)}` : '❌ NOT FOUND'}`);

    if (!priceId) {
      console.error("❌ FATAL: Price ID is null or undefined. Make sure STRIPE_PRO_PLAN_PRICE_ID is set in .env.local and the server was restarted.");
      return NextResponse.json({ message: 'Invalid plan' }, { status: 400 });
    }
    if (!secretKey) {
      console.error("❌ FATAL: Stripe secret key is not configured. Make sure STRIPE_SECRET_KEY is set in .env.local and the server was restarted.");
      return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    }

    console.log("[4/5] Attempting to create Stripe session...");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'pix'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/pricing`,
      client_reference_id: user._id.toString(),
      metadata: {
        plan: plan,
      },
    });

    console.log(`[5/5] 🎉 Stripe session created successfully: ${session.id}`);
    return NextResponse.json({ sessionId: session.id });

  } catch (error) {
    console.error('\n--- ❌ STRIPE CHECKOUT ERROR ---');
    console.error(error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
