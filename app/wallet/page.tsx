'use client'
import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {Elements} from '@stripe/react-stripe-js';
import CreditCardForm from '../components/CreditCardForm';
import {loadStripe} from '@stripe/stripe-js';
import {useRouter} from "next/navigation";
import CardComponent from "@/app/components/CardComponent";
import {LoadingComponent} from "@/app/components/LoadingComponent";


type CreditCardInfoType = {
    cardNumber: string;
    cardType: string;
    expirationYear: string;
    billingName: string;
} | null;

export default function WalletPage() {
    const [isPaymentMethodSaved, setIsPaymentMethodSaved] = useState(true);
    const [creditCardInfo, setCreditCardInfo] = useState<CreditCardInfoType>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const stripePromise = loadStripe(process.env.NEXT_PUBLIC_PUBLIC_STRIPE_PUBLIC_KEY!);

    useEffect(() => {
        const paymentMethodId = localStorage.getItem('payment_token_id');
        setIsPaymentMethodSaved(!!paymentMethodId);
        createCustomerAndSetupIntent();
        if (isPaymentMethodSaved && !creditCardInfo) {
            updatePaymentInformation(paymentMethodId!);
        }
    }, []);

    async function updatePaymentInformation(paymentMethodId: string) {

        if (!paymentMethodId) {
            console.error("Payment method ID is null.");
            return;
        }

        const customerId = localStorage.getItem('customer_id');
        if (!customerId) {
            console.error("Customer ID is null.");
            return;
        }

        setLoading(true);
        const paymentInfo = await getPaymentInformation(customerId, paymentMethodId);
        setCreditCardInfo(paymentInfo);
        setIsPaymentMethodSaved(true);
        setLoading(false);
    }

    const clearPaymentMethod = () => {
        ['payment_token_id', 'customer_id', 'customer_client_secret'].forEach(item => localStorage.removeItem(item));
        setIsPaymentMethodSaved(false);
        router.back();
    };

    if (loading) {
        return (<LoadingComponent/>);
    }

    return (
        <Elements stripe={stripePromise}>
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="self-start bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    <Link href="/">⬅️ Back</Link>
                </div>

                {isPaymentMethodSaved && (
                    <div className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-center">
                        <button onClick={clearPaymentMethod}>Clear Wallet</button>
                    </div>
                )}

                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                    {(isPaymentMethodSaved && creditCardInfo) ? (
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M5 13l4 4L19 7"/>
                                </svg>
                                <span className="text-green-500">Payment Method Saved</span>
                            </div>
                            <CardComponent creditCardInfo={creditCardInfo}/>
                        </div>
                    ) : (
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

