import React from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { StripeCardElementChangeEvent } from '@stripe/stripe-js';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4"
      }
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a"
    }
  }
};

type CreditCardFormProps = {
    updatePaymentInformation: (event:StripeCardElementChangeEvent) => void;
};

export default function CreditCardForm({ updatePaymentInformation }: CreditCardFormProps) {
 
  const stripePromise = useStripe();
  const elements = useElements();

const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripePromise || !elements) {
        return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
        console.error('Card Element not found.');
        return;
    }

    const result = await stripePromise.createToken(cardElement);
    if (result.error) {
        console.error(result.error.message);
    } else {
        localStorage.setItem('payment_token_id', result.token.id);
        console.log('Payment Method ID saved locally:', result.token.id);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mx-auto mt-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border p-2 rounded">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <button 
          type="submit" 
          disabled={!stripePromise} 
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          Save Card
        </button>
      </form>
    </div>
  );
}