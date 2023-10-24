'use client';
import React from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

export default function CreditCardForm() {
  const stripe = useStripe();
  const elements = useElements();

const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
        return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
        console.error('Card Element not found.');
        return;
    }

    const result = await stripe.createToken(cardElement);
    if (result.error) {
        console.error(result.error.message);
    } else {
        console.log(result.token);
        // Save in client state for later use (only for demo)
        
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg">
        Save Card
      </button>
    </form>
  );
}
