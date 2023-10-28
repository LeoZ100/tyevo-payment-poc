'use client';
import React, {useState} from 'react';
import Link from "next/link";
import getUuidByString from "uuid-by-string";

export default function RidePage() {
    const [loading, setLoading] = useState(false);
    const [formAmount, setFormAmount] = useState(0);
    const [currency, setCurrency] = useState('usd');
    const [smokeTrail, setSmokeTrail] = useState('');
    const [rideComplete, setRideComplete] = useState(false);
    const [receiptId, setReceiptId] = useState('');
    const customerId = typeof window !== 'undefined' ? localStorage.getItem('customer_id') : null;
    const paymentMethodId = typeof window !== 'undefined' ? localStorage.getItem('payment_token_id') : null;

    const initiateRideAnimation = () => {
        setLoading(true);
        let smokeCount = 0;

        const smokeInterval = setInterval(() => {
            smokeCount++;
            if (smokeCount > 3) smokeCount = 1;
            setSmokeTrail('💨'.repeat(smokeCount));
        }, 500); // Add smoke every half second

        setTimeout(() => {
            clearInterval(smokeInterval);
            handleRide();
            setSmokeTrail('');
        }, 3000);
    };

    const handleRide = async () => {
        if (!customerId || !paymentMethodId) {
            console.error("Missing customer_id or payment_token_id.");
            return;
        }

        const amount = getStripe(formAmount!, currency);

        try {
            const response = await fetch('/api/charge-customer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({amount, currency, customerId, paymentMethodId}),
            });

            if (!response.ok) {
                throw new Error('Server response was not ok.');
            }

            setRideComplete(true);
            const paymentIntentId = (await response.json()).paymentIntentId;
            const idFromIntent = getUuidByString(paymentIntentId);
            setReceiptId(idFromIntent);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    function getStripe(amountAtMinimumCurrencyUnit: number, currency: string): number {
        switch (currency) {
            case 'usd':
                return amountAtMinimumCurrencyUnit * 100;
            case 'dop':
                return amountAtMinimumCurrencyUnit * 100;
            default:
                return amountAtMinimumCurrencyUnit;
        }

    }


    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <div className="self-start bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                <Link href="/">⬅️ Back</Link>
            </div>
            {
                rideComplete && (
                    <div className="bg-white p-8 mt-8 rounded-lg shadow-lg w-full max-w-md text-center">
                        <h2 className="text-xl font-bold mb-4">Ride Complete!</h2>
                        <p>Your card has been charged successfully.</p>
                        <p>Please check the <a className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" href='https://dashboard.stripe.com/test/payments'>Stripe Console</a> for transaction details.</p>
                        <p>Receive No.: <span className="font-bold">{receiptId}</span></p>
                    </div>
                )
            }
            <div className="mb-4 text-8xl">
                🚗{smokeTrail}
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <form className="mb-4" onSubmit={e => e.preventDefault()}>
                    <div className="mb-2">
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount to Charge</label>
                        <input
                            id="amount"
                            min="0"
                            type="number"
                            disabled={loading}
                            value={formAmount || ''}
                            onChange={(e) => {
                                setRideComplete(false);
                                setFormAmount(+e.target.value)
                            }}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="mb-2">
                        <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency</label>
                        <select
                            id="currency"
                            disabled={loading}
                            value={currency}
                            onChange={e => setCurrency(e.target.value)}
                            className="mt-1 p-2 w-full border rounded-md"
                        >
                            <option value="usd">USD</option>
                            <option value="dop">DOP</option>
                        </select>
                    </div>
                </form>

                <button
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300"
                    disabled={loading || formAmount === 0}
                    onClick={initiateRideAnimation}>
                    Take Ride
                </button>
            </div>
        </div>
    );
}
