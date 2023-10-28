import {Stripe} from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {apiVersion: '2023-10-16'});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {amount, currency, customerId, paymentMethodId} = body;

        // Make sure you have all the required data
        if (!(amount && currency && customerId && paymentMethodId)) {
            return new Response('Required information is missing', {status: 400});
        }

        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: currency,
                customer: customerId,
                payment_method: paymentMethodId,
                off_session: true,
                confirm: true,
                description: 'Tyevo Ride payment @ ' + new Date().toLocaleString('en-US', {timeZone: 'America/New_York'}),
            });

            // If you reach this point, the payment was successful
            return new Response(JSON.stringify({message: 'success', paymentIntentId: paymentIntent.id}), {status: 200});

        } catch (err: any) {
            // Handle the case where authentication is required
            if (err.code === 'authentication_required') {
                // Retrieve the PaymentIntent to handle authentication on the client side
                const paymentIntentRetrieved = await stripe.paymentIntents.retrieve(err.raw.payment_intent.id);
                return new Response(JSON.stringify({message: 'requires_authentication'}), {status: 402});
            }

            // Handle other errors
            return new Response(JSON.stringify({message: err.message}), {status: 500});
        }

    } catch (error: any) {
        return new Response(JSON.stringify({message: error.message}), {status: 500});
    }
}
