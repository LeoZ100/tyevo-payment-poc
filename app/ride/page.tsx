'use client';
import {useState} from 'react';
import {loadStripe} from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

function RidePage() {
  const [loading, setLoading] = useState(false);

  const handleRide = async () => {
    setLoading(true);
    const amount = 5000;  // Amount in cents
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount }),
    });
    const sessionId = await response.text();
    const stripe = await stripePromise;
    if (!stripe) {
        console.error('Stripe failed to initialize.');
        setLoading(false);
        return;
    }
    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) {
      console.warn(error.message);
    }
    setLoading(false);
  };

  return (
    <button disabled={loading} onClick={handleRide}>
      Take Ride
    </button>
  );
}

export default RidePage;
