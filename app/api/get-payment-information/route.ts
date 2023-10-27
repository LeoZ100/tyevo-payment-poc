import Stripe from 'stripe';
import {NextRequest} from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {  apiVersion: '2023-10-16' });

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.nextUrl);
    const customer_id = searchParams.get('customer_id');
    const payment_method_id = searchParams.get('payment_method_id');

    if (!payment_method_id || !customer_id) {
        return new Response('Missing payment method or customer id', { status: 400 });
    }

    try {
        const paymentMethod = await stripe.customers.retrievePaymentMethod(customer_id, payment_method_id);


        return new Response(JSON.stringify(paymentMethod), { status: 200 });
    } catch (error: any) {
        return new Response(JSON.stringify({error: error.message}), { status: 500 });
    }
}