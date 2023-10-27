'use client'
import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {Elements} from '@stripe/react-stripe-js';
import CreditCardForm from '../components/CreditCardForm';
import {loadStripe} from '@stripe/stripe-js';
import {SetupIntentResult} from "@stripe/stripe-js/types/stripe-js/stripe";
import {useRouter} from "next/navigation";
import CardComponent from "@/app/components/CardComponent";

export default function WalletPage() {
    const [isPaymentMethodSaved, setIsPaymentMethodSaved] = useState(false);
    const [creditCardInfo, setCreditCardInfo] = useState({
        cardNumber: '',
        cardType: '',
        expirationYear: '',
        billingName: ''
    });
    const [loading, setLoading] = useState(false)
    const router = useRouter();  // useRouter hook initialization


    // Stripe
    const stripePromise = loadStripe(process.env.NEXT_PUBLIC_PUBLIC_STRIPE_PUBLIC_KEY!);

    useEffect(() => {
        const paymentMethodId = localStorage.getItem('payment_token_id');
        setIsPaymentMethodSaved(!!paymentMethodId);
        createCustomerAndSetupIntent().then(r => {
            console.log("Customer ID:", localStorage.getItem('customer_id'));
        });
    }, []);

    const clearPaymentMethod = () => {
        // clear local storage
        localStorage.removeItem('payment_token_id');
        localStorage.removeItem('customer_id');
        localStorage.removeItem('customer_client_secret');
        setIsPaymentMethodSaved(false);
        router.back();
    };

    function updatePaymentInformation(setupResult: SetupIntentResult) {
        setLoading(true);
        const paymentId:string = setupResult.setupIntent?.payment_method?.toString()!;

        if (!setupResult.setupIntent) {
            console.error("Setup intent is null.");
            return;
        }

        const customerId = localStorage.getItem('customer_id');
        if (!customerId) {
            console.error("Customer ID is null.");
            return;
        }

        console.log("Updating payment information...");
        getPaymentInformation( customerId, paymentId).then(paymentInfo => {
            setCreditCardInfo(paymentInfo);
            setIsPaymentMethodSaved(true);
        });
        setLoading(false);
    }
    

    return (
        <Elements stripe={stripePromise}>
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="self-start ml-4 mb-4">
                    <Link href="/" className="text-blue-500 hover:text-blue-700">Back</Link>
                </div>
                {isPaymentMethodSaved && <div className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 tx text-center">
                    <button onClick={clearPaymentMethod}>Clear Wallet</button>
                </div>}
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                    {isPaymentMethodSaved && (
                        <div className="flex items-center space-x-2 mb-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-green-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                            <span className="text-green-500">Payment Method Saved</span>
                            <CardComponent creditCardInfo={creditCardInfo} />
                        </div>
                    )}
                    {!isPaymentMethodSaved && (
                        <div>
                            <p className="mb-4 text-gray-700 text-center">No Payment Method Saved</p>
                            <CreditCardForm updatePaymentInformation={updatePaymentInformation}/>
                        </div>
                    )}
                </div>
            </div>
        </Elements>
    );
}

async function createCustomerAndSetupIntent() {

    // Check if customer already exists in local storage
    const customerId = localStorage.getItem('customer_id');

    if (customerId && customerId !== 'undefined') {
        console.log('Customer already exists:', customerId);
        return;
    }

    const response = await fetch('/api/create-customer', {
        method: 'POST',
    });

    if (!response.ok) {
        console.error("Error creating customer:", response.statusText);
        return;
    }

    let customer = await response.json();
    localStorage.setItem('customer_id', customer.customer_id);
    localStorage.setItem('customer_client_secret', customer.customer_client_secret);
    console.log('Created customer with ID:', customer.customer_id);
}

async function getPaymentInformation(customerId: string, paymentMethodId: string) {
    console.log("Getting payment information for customer:", customerId, "and payment method:", paymentMethodId);
    const response = await fetch('/api/get-payment-information'
        + '?payment_method_id=' + paymentMethodId
        + '&customer_id=' + customerId);

    const paymentInformation = await response.json();
    console.log("Payment information:", paymentInformation);
    return {
        cardNumber: "**** **** **** " + paymentInformation.card.last4,
        cardType: paymentInformation.card.brand,
        expirationYear: paymentInformation.card.exp_year,
        billingName: paymentInformation.billing_details.name
    };
}

