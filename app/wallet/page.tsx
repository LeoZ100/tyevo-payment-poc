'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';  // Import the Link component
import { Elements } from '@stripe/react-stripe-js';
import CreditCardForm from '../components/CreditCardForm';
import { loadStripe } from '@stripe/stripe-js';

export default function WalletPage() {
    const [isPaymentMethodSaved, setIsPaymentMethodSaved] = useState(false);
    const stripePromise = loadStripe(process.env.NEXT_PUBLIC_PUBLIC_STRIPE_PUBLIC_KEY!);

    useEffect(() => {
        const paymentMethodId = localStorage.getItem('payment_token_id');
        setIsPaymentMethodSaved(!!paymentMethodId);
    }, []);

    const clearPaymentMethod = () => {
        localStorage.removeItem('payment_token_id');
        setIsPaymentMethodSaved(false);
    };

    const updatePaymentInformation = () => {
        setIsPaymentMethodSaved(true);
    };

    return (
        <Elements stripe={stripePromise}>
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="self-start ml-4 mb-4">
                    <Link href="/" className="text-blue-500 hover:text-blue-700">Back</Link>
                </div>
                <div className="text-center mb-4">
                    <button onClick={clearPaymentMethod}>Clear Wallet</button>
                </div>
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                    {isPaymentMethodSaved ? (
                        <div className="flex items-center space-x-2 mb-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-green-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                            <span className="text-green-500">Payment Method Saved</span>
                        </div>
                    ) : (
                        <p className="mb-4 text-gray-700">No Payment Method Saved</p>
                    )}
                    <CreditCardForm updatePaymentInformation={updatePaymentInformation} />
                </div>
            </div>
        </Elements>
    );
}
