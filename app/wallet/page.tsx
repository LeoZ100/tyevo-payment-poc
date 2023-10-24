'use client'

import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import CreditCardForm from '../components/CreditCardForm';
import { loadStripe } from '@stripe/stripe-js';
import { env } from 'process';

export default function WalletPage() {
    console.log(process.env.PUBLIC_STRIPE_PUBLIC_KEY)
  return (
    <Elements stripe={loadStripe(process.env.PUBLIC_STRIPE_PUBLIC_KEY)}>
      <div className="min-h-screen flex items-center justify-center">
        <CreditCardForm />
      </div>
    </Elements>
  );
}
