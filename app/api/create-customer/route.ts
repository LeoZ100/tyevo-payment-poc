import {Stripe} from 'stripe';
import {generate} from "random-words";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {  apiVersion: '2023-10-16' });

export async function POST(request: Request) {
  try {
      // Create a dummy customer in Stripe
      const customer = await stripe.customers.create({email: generate() + '@exampleAtTyevo.com'});
      
      // Create Intent
      const intent = await stripe.setupIntents.create({
        customer: customer.id,
      });
      
     return new Response(JSON.stringify({"customer_id": customer.id, "customer_client_secret": intent.client_secret}), { status: 200 });
  } catch (error: any) {
    return new Response(error, { status: 500 });
    }
  }
