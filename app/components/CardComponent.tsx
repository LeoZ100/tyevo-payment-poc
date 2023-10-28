import React from 'react';
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';


type CardComponentProps = {
    creditCardInfo: {
        cardNumber: string;
        cardType: string;
        expirationYear: string;
        billingName: string;
    }
}

export default function CardComponent({creditCardInfo}: CardComponentProps) {

    return (
        <Cards cvc={'***'}
               expiry={"**/" + creditCardInfo.expirationYear}
               name={creditCardInfo.billingName}
               number={creditCardInfo.cardNumber}
               issuer={creditCardInfo.cardType == 'amex' ? 'american-express' : creditCardInfo.cardType}
               preview={true}/>
    );
}
