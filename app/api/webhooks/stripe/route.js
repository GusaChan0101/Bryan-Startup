import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function POST(req) {
  const body = await req.text();
  const sig = headers().get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('✅ Checkout session completed:', session);

      const userId = session.client_reference_id;
      if (!userId) {
        console.error('❌ Error: No userId in checkout session metadata');
        // Return a 200 to Stripe so it doesn't retry, but log the error
        return new NextResponse('Webhook Error: No userId in session', { status: 200 });
      }

      // Assumes you pass the plan type in metadata. Example: { plan: 'premium' }
      const plan = session.metadata.plan;
      if (!plan) {
        console.error('❌ Error: No plan in checkout session metadata');
        return new NextResponse('Webhook Error: No plan in session metadata', { status: 200 });
      }

      try {
        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection('users').updateOne(
          { _id: new ObjectId(userId) },
          { 
            $set: { 
              plan: plan, 
              stripeCustomerId: session.customer 
            } 
          }
        );

        if (result.matchedCount === 0) {
            console.error(`❌ No user found with ID: ${userId}`);
        } else {
            console.log(`✅ User ${userId} plan updated to ${plan}`);
        }

      } catch (dbError) {
        console.error(`📦 Database error: ${dbError.message}`);
        return new NextResponse(`Webhook Database Error: ${dbError.message}`, { status: 500 });
      }

      break;
    
    // TODO: Handle other events like subscription updates or cancellations
    // case 'customer.subscription.updated':
    // case 'customer.subscription.deleted':

    default:
      console.warn(`🤷 Unhandled event type ${event.type}`);
  }

  return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
}

export { POST };
