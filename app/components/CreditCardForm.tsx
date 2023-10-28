import React from 'react';
import {CardElement, useElements, useStripe} from '@stripe/react-stripe-js';
import {generate} from "random-words";

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
    updatePaymentInformation: (paymentMethodId: string) => void;
};

export default function CreditCardForm({updatePaymentInformation}: CreditCardFormProps) {
    const [paymentMethodDeclined, setPaymentMethodDeclined] = React.useState(false);
    const [paymentMethodDeclinedMessage, setPaymentMethodDeclinedMessage] = React.useState('');
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

        const result = await stripePromise.confirmCardSetup(
            localStorage.getItem('customer_client_secret')!,
            {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: 'John ' + generate() + ' Doe',
                    },
                },
            }
        );

        if (result.error) {
            console.error("Error confirming card setup: ", result.error.message);
            setPaymentMethodDeclined(true);
            setPaymentMethodDeclinedMessage(result.error.message ? result.error.message : 'Your card was declined, contact your bank for more information.');
            return;
        }

        localStorage.setItem('payment_token_id', result.setupIntent?.payment_method?.toString()!);
        console.log("Card information updated and saved.");
        const paymendMethodId = result.setupIntent?.payment_method?.toString();
        updatePaymentInformation(paymendMethodId!);
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border p-2 rounded">
                    <CardElement options={CARD_ELEMENT_OPTIONS}/>
                </div>
                <button
                    type="submit"
                    disabled={!stripePromise}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    Save Card
                </button>
            </form>
            {
                paymentMethodDeclined && (
                    <div className="bg-red-500 text-white px-4 py-2 rounded-lg mt-4">
                        {paymentMethodDeclinedMessage}
                    </div>
                )
            }
        </div>
    );
}