 # 🔥 labs11-adNetwork-BE 🔥

##### Backend URL : https://lad-network.herokuapp.com

### Project Management
- [TrelloV1](https://trello.com/b/QyrA6PgD/labs11-non-creepy-ad-network) 🌍
- [TrelloV2](https://trello.com/b/cXZ3clQ7/lad-network) 🌍


## Table of Contents
 - [Summary Table of API Endpoints](#summary-table-of-api-endpoints)
   - [User](#user)
   - [Offers](#offers)
   - [Ads](#ads)
   - [Analytics](#analytics)
   - [Checkout Payments](#checkout-payments)
   



### Summary Table of API Endpoints
| Type   | Endpoints                      | Description                      |
| ------ | ------------------------------ | -------------------------------- |
| POST   | /api/auth/register             | Register User using Auth0        |
| GET    | /api/api/users                 | Get User Info                    |
| PUT    | /api/api/users/:id             | Update User                      |
| DELETE | /api/api/users                 | Delete User Account              |
| GET    | /api/offers                    | Get offers                       |
| GET    | /api/offers/:id                | Get offers by id                 |
| POST   | /api/offers                    | Add offers                       |
| PUT    | /api/offers/:id                | Update Offer                     |
| DELETE | /api/offers/:id                | Delete Offer                     |
| GET    | /api/ads                       | get all ads                      |
| GET    | /api/ads/:id                   | Get ads by id                    |
| POST   | /api/ads                       | Post an ads                      |
| PUT    | /api/ads/:id                   | update ads by id                 |
| DELETE | /api/ads/:id                   | Delete an ads                    |
| GET    | /api/ads/offers/:id            | get offers by id                 |
| GET    | /api/ads/allads/:id            | get accepted ads by affiliate_id |
| GET    | /api/analytics                 | GET analytics                    |
| GET    | /api/analytics/:id             | Get analytics by id              |
| POST   | /api/analytics                 | POST analytics                   |
| POST   | /api/checkout/connect_customer | Post StripeConnect/create        |
| POST   | /api/checkout/create_customer  | Post Cosumter/create             |
| POST   | /api/checkout/charge_customer  | Post StripeConnect/create        |
| POST   | /api/checkout/connect_customer | POST charge customer             |
| POST   | /api/checkout/payout           | POST payout customer (affiliate) |
| GET    | /api/checkout/payout           | GET payouts for customer         |
| GET    | /api/checkout/payments         | GET charge customer (advertiser) |


#### Register and Login Options
![](assets/loginoptions.png)



#### User

`GET, PUT, DELETE 200 success ✅ Private`
```
{
    "id": 4,
    "name": "John Benedict Miranda",
    "email": "jbmiranda22796@gmail.com",
    "image_url": "https://media.licdn.com/dms/image/C4E03AQHWn1xyl8YaSA/profile-displayphoto-shrink_100_100/0?e=1560384000&v=beta&t=rSgo6M7-lDWtq772krO-EBB8gskFCGRlecEbVqQEJDU",
    "nickname": "jbmiranda22796",
    "sub": "linkedin|5gWW_xGV9g",
    "acct_type": "affiliate",
    "phone": null,
    "amount": 0,
    "show_tour": true,
    "stripe_cust_id": null,
    "stripe_payout_id": null,
    "stripe_balance": 0,
    "offers": 0,
    "ads": 0,
    "agreements": 1
}
```


#### Offers 
`GET, DELETE, PUT 200 success ✅`
```
 [
    {
        "id": 1,
        "price_per_click": 0.5,
        "price_per_impression": 0.02,
        "num_applicants": 0,
        "budget": 150,
        "name": "Hamza's Offer",
        "description": "Hamza's Description",
        "category": "Finance",
        "currency": "USD",
        "status": true,
        "user_id": 2,
        "created_at": "2019-04-12T22:26:12.853Z",
        "updated_at": "2019-04-12T22:26:12.853Z",
        "active": false,
        "accepted": false,
        "agreement_id": null
    }
  ]
```
`500 error ❌ `
```
  {
    "message": {
        "message": "Invalid token specified: Unexpected token \u0007 in JSON at position 278"
    }
}
```

#### Ads 
`GET, DELETE, PUT 200 success ✅`
```
[
    {
        "id": 1,
        "name": "HELLO",
        "destination_url": "",
        "active": true,
        "size": "horizontal_banner",
        "offer_id": 1,
        "user_id": 2,
        "image": "https://res.cloudinary.com/dypcywjue/image/upload/v1555108065/blbbqzuvg5m7hdkg2hhv.png",
        "created_at": "2019-04-12T22:27:45.368Z",
        "updated_at": "2019-04-12T22:27:45.368Z"
    }
  ]
```

#### Analytics 
`GET, DELETE, PUT 200 success ✅`
```
{
    "clicks": [],
    "impressions": [],
    "conversions": [],
    "actionCount": {
        "impressions": 0,
        "clicks": 0,
        "conversions": 0
    },
    "browserCount": {
        "chrome": 0,
        "safari": 0,
        "edge": 0,
        "firefox": 0,
        "other": 0
    },
    "cities": [],
    "growth": {
        "clicks": null,
        "impressions": null,
        "conversions": null
    },
    "offersRanking": [
        {
            "id": 1,
            "price_per_click": 0.5,
            "price_per_impression": 0.02,
            "num_applicants": 0,
            "budget": 150,
            "name": "Hamza's Offer",
            "description": "Hamza's Description",
            "category": "Finance",
            "currency": "USD",
            "status": true,
            "user_id": 2,
            "created_at": "2019-04-12T22:26:12.853Z",
            "updated_at": "2019-04-12T22:26:12.853Z",
            "ctr": 100
        }
    ],
    "devices": []
}
```
#### Checkout Payments 
`GET, DELETE, PUT 200 success ✅`
```
{
    "payments": [
        {
            "id": "ch_1EOyfNFtiYWtPmMqBAjNie1k",
            "object": "charge",
            "amount": 208,
            "amount_refunded": 0,
            "application": null,
            "application_fee": null,
            "application_fee_amount": null,
            "balance_transaction": "txn_1EOyfNFtiYWtPmMqFkX8dfkh",
            "billing_details": {
                "address": {
                    "city": null,
                    "country": null,
                    "line1": null,
                    "line2": null,
                    "postal_code": null,
                    "state": null
                },
                "email": null,
                "name": null,
                "phone": null
            },
            "captured": true,
            "created": 1555211161,
            "currency": "usd",
            "customer": "cus_EsIRnWewoCzOGn",
            "description": "Your payment receipt from the LAD Network",
            "destination": null,
            "dispute": null,
            "failure_code": null,
            "failure_message": null,
            "fraud_details": {},
            "invoice": null,
            "livemode": false,
            "metadata": {},
            "on_behalf_of": null,
            "order": null,
            "outcome": {
                "network_status": "approved_by_network",
                "reason": null,
                "risk_level": "normal",
                "risk_score": 47,
                "seller_message": "Payment complete.",
                "type": "authorized"
            },
            "paid": true,
            "payment_intent": null,
            "payment_method": "card_1EOXqKFtiYWtPmMqTzjYKDdd",
            "payment_method_details": {
                "card": {
                    "brand": "visa",
                    "checks": {
                        "address_line1_check": null,
                        "address_postal_code_check": null,
                        "cvc_check": null
                    },
                    "country": "US",
                    "exp_month": 4,
                    "exp_year": 2020,
                    "fingerprint": "lj2y3c7tkwljiZH1",
                    "funding": "credit",
                    "last4": "4242",
                    "three_d_secure": null,
                    "wallet": null
                },
                "type": "card"
            },
            "receipt_email": "elkhoudh@gmail.com",
            "receipt_number": "1895-0045",
            "receipt_url": "https://pay.stripe.com/receipts/acct_1E88ZVFtiYWtPmMq/ch_1EOyfNFtiYWtPmMqBAjNie1k/rcpt_Esk90zXkiuCH69DQ7kwgpTJBGzzMyJ6",
            "refunded": false,
            "refunds": {
                "object": "list",
                "data": [],
                "has_more": false,
                "total_count": 0,
                "url": "/v1/charges/ch_1EOyfNFtiYWtPmMqBAjNie1k/refunds"
            },
            "review": null,
            "shipping": null,
            "source": {
                "id": "card_1EOXqKFtiYWtPmMqTzjYKDdd",
                "object": "card",
                "address_city": null,
                "address_country": null,
                "address_line1": null,
                "address_line1_check": null,
                "address_line2": null,
                "address_state": null,
                "address_zip": null,
                "address_zip_check": null,
                "brand": "Visa",
                "country": "US",
                "customer": "cus_EsIRnWewoCzOGn",
                "cvc_check": null,
                "dynamic_last4": null,
                "exp_month": 4,
                "exp_year": 2020,
                "fingerprint": "lj2y3c7tkwljiZH1",
                "funding": "credit",
                "last4": "4242",
                "metadata": {},
                "name": null,
                "tokenization_method": null
            },
            "source_transfer": null,
            "statement_descriptor": null,
            "status": "succeeded",
            "transfer_data": null,
            "transfer_group": null
        },
        {
            "id": "ch_1EOv3iFtiYWtPmMqVpihpEMP",
            "object": "charge",
            "amount": 220,
            "amount_refunded": 0,
            "application": null,
            "application_fee": null,
            "application_fee_amount": null,
            "balance_transaction": "txn_1EOv3iFtiYWtPmMqPRB7SmNA",
            "billing_details": {
                "address": {
                    "city": null,
                    "country": null,
                    "line1": null,
                    "line2": null,
                    "postal_code": null,
                    "state": null
                },
                "email": null,
                "name": null,
                "phone": null
            },
            "captured": true,
            "created": 1555197294,
            "currency": "usd",
            "customer": "cus_EsLRvkpiK02tAx",
            "description": "Your payment receipt from the LAD Network",
            "destination": null,
            "dispute": null,
            "failure_code": null,
            "failure_message": null,
            "fraud_details": {},
            "invoice": null,
            "livemode": false,
            "metadata": {},
            "on_behalf_of": null,
            "order": null,
            "outcome": {
                "network_status": "approved_by_network",
                "reason": null,
                "risk_level": "normal",
                "risk_score": 41,
                "seller_message": "Payment complete.",
                "type": "authorized"
            },
            "paid": true,
            "payment_intent": null,
            "payment_method": "card_1EOal0FtiYWtPmMqsch54zLv",
            "payment_method_details": {
                "card": {
                    "brand": "visa",
                    "checks": {
                        "address_line1_check": null,
                        "address_postal_code_check": null,
                        "cvc_check": null
                    },
                    "country": "US",
                    "exp_month": 4,
                    "exp_year": 2020,
                    "fingerprint": "lj2y3c7tkwljiZH1",
                    "funding": "credit",
                    "last4": "4242",
                    "three_d_secure": null,
                    "wallet": null
                },
                "type": "card"
            },
            "receipt_email": "Kieranvieira@live.com",
            "receipt_number": "1932-6622",
            "receipt_url": "https://pay.stripe.com/receipts/acct_1E88ZVFtiYWtPmMq/ch_1EOv3iFtiYWtPmMqVpihpEMP/rcpt_EsgQGffyc36tB2Tl8z0HYLfTzQTY0OK",
            "refunded": false,
            "refunds": {
                "object": "list",
                "data": [],
                "has_more": false,
                "total_count": 0,
                "url": "/v1/charges/ch_1EOv3iFtiYWtPmMqVpihpEMP/refunds"
            },
            "review": null,
            "shipping": null,
            "source": {
                "id": "card_1EOal0FtiYWtPmMqsch54zLv",
                "object": "card",
                "address_city": null,
                "address_country": null,
                "address_line1": null,
                "address_line1_check": null,
                "address_line2": null,
                "address_state": null,
                "address_zip": null,
                "address_zip_check": null,
                "brand": "Visa",
                "country": "US",
                "customer": "cus_EsLRvkpiK02tAx",
                "cvc_check": null,
                "dynamic_last4": null,
                "exp_month": 4,
                "exp_year": 2020,
                "fingerprint": "lj2y3c7tkwljiZH1",
                "funding": "credit",
                "last4": "4242",
                "metadata": {},
                "name": null,
                "tokenization_method": null
            },
            "source_transfer": null,
            "statement_descriptor": null,
            "status": "succeeded",
            "transfer_data": null,
            "transfer_group": null
        },
        {
            "id": "ch_1EOacSFtiYWtPmMqquxnFc85",
            "object": "charge",
            "amount": 104,
            "amount_refunded": 0,
            "application": null,
            "application_fee": null,
            "application_fee_amount": null,
            "balance_transaction": "txn_1EOacSFtiYWtPmMqJzWvQmDm",
            "billing_details": {
                "address": {
                    "city": null,
                    "country": null,
                    "line1": null,
                    "line2": null,
                    "postal_code": null,
                    "state": null
                },
                "email": null,
                "name": null,
                "phone": null
            },
            "captured": true,
            "created": 1555118724,
            "currency": "usd",
            "customer": "cus_EsIRnWewoCzOGn",
            "description": "Your payment receipt from the LAD Network",
            "destination": null,
            "dispute": null,
            "failure_code": null,
            "failure_message": null,
            "fraud_details": {},
            "invoice": null,
            "livemode": false,
            "metadata": {},
            "on_behalf_of": null,
            "order": null,
            "outcome": {
                "network_status": "approved_by_network",
                "reason": null,
                "risk_level": "normal",
                "risk_score": 7,
                "seller_message": "Payment complete.",
                "type": "authorized"
            },
            "paid": true,
            "payment_intent": null,
            "payment_method": "card_1EOXqKFtiYWtPmMqTzjYKDdd",
            "payment_method_details": {
                "card": {
                    "brand": "visa",
                    "checks": {
                        "address_line1_check": null,
                        "address_postal_code_check": null,
                        "cvc_check": null
                    },
                    "country": "US",
                    "exp_month": 4,
                    "exp_year": 2020,
                    "fingerprint": "lj2y3c7tkwljiZH1",
                    "funding": "credit",
                    "last4": "4242",
                    "three_d_secure": null,
                    "wallet": null
                },
                "type": "card"
            },
            "receipt_email": "elkhoudh@gmail.com",
            "receipt_number": null,
            "receipt_url": "https://pay.stripe.com/receipts/acct_1E88ZVFtiYWtPmMq/ch_1EOacSFtiYWtPmMqquxnFc85/rcpt_EsLJAHs07esmvr3qT1xFhGCA9QckkQS",
            "refunded": false,
            "refunds": {
                "object": "list",
                "data": [],
                "has_more": false,
                "total_count": 0,
                "url": "/v1/charges/ch_1EOacSFtiYWtPmMqquxnFc85/refunds"
            },
            "review": null,
            "shipping": null,
            "source": {
                "id": "card_1EOXqKFtiYWtPmMqTzjYKDdd",
                "object": "card",
                "address_city": null,
                "address_country": null,
                "address_line1": null,
                "address_line1_check": null,
                "address_line2": null,
                "address_state": null,
                "address_zip": null,
                "address_zip_check": null,
                "brand": "Visa",
                "country": "US",
                "customer": "cus_EsIRnWewoCzOGn",
                "cvc_check": null,
                "dynamic_last4": null,
                "exp_month": 4,
                "exp_year": 2020,
                "fingerprint": "lj2y3c7tkwljiZH1",
                "funding": "credit",
                "last4": "4242",
                "metadata": {},
                "name": null,
                "tokenization_method": null
            },
            "source_transfer": null,
            "statement_descriptor": null,
            "status": "succeeded",
            "transfer_data": null,
            "transfer_group": null
        },
        {
            "id": "ch_1EOEsIFtiYWtPmMqimD3rL9w",
            "object": "charge",
            "amount": 110700,
            "amount_refunded": 0,
            "application": null,
            "application_fee": null,
            "application_fee_amount": null,
            "balance_transaction": "txn_1EOEsIFtiYWtPmMqnTH2rBoV",
            "billing_details": {
                "address": {
                    "city": null,
                    "country": null,
                    "line1": null,
                    "line2": null,
                    "postal_code": null,
                    "state": null
                },
                "email": null,
                "name": null,
                "phone": null
            },
            "captured": true,
            "created": 1555035138,
            "currency": "usd",
            "customer": "cus_ErvvxFFtXEYS88",
            "description": "Your payment receipt from the LAD Network",
            "destination": null,
            "dispute": null,
            "failure_code": null,
            "failure_message": null,
            "fraud_details": {},
            "invoice": null,
            "livemode": false,
            "metadata": {},
            "on_behalf_of": null,
            "order": null,
            "outcome": {
                "network_status": "approved_by_network",
                "reason": null,
                "risk_level": "normal",
                "risk_score": 1,
                "seller_message": "Payment complete.",
                "type": "authorized"
            },
            "paid": true,
            "payment_intent": null,
            "payment_method": "card_1EOC3qFtiYWtPmMqbKuUjdqM",
            "payment_method_details": {
                "card": {
                    "brand": "visa",
                    "checks": {
                        "address_line1_check": null,
                        "address_postal_code_check": null,
                        "cvc_check": null
                    },
                    "country": "US",
                    "exp_month": 4,
                    "exp_year": 2020,
                    "fingerprint": "lj2y3c7tkwljiZH1",
                    "funding": "credit",
                    "last4": "4242",
                    "three_d_secure": null,
                    "wallet": null
                },
                "type": "card"
            },
            "receipt_email": "elkhoudh@gmail.com",
            "receipt_number": null,
            "receipt_url": "https://pay.stripe.com/receipts/acct_1E88ZVFtiYWtPmMq/ch_1EOEsIFtiYWtPmMqimD3rL9w/rcpt_ErypG64xX3FmrIq4diOko0hZCatq0kT",
            "refunded": false,
            "refunds": {
                "object": "list",
                "data": [],
                "has_more": false,
                "total_count": 0,
                "url": "/v1/charges/ch_1EOEsIFtiYWtPmMqimD3rL9w/refunds"
            },
            "review": null,
            "shipping": null,
            "source": {
                "id": "card_1EOC3qFtiYWtPmMqbKuUjdqM",
                "object": "card",
                "address_city": null,
                "address_country": null,
                "address_line1": null,
                "address_line1_check": null,
                "address_line2": null,
                "address_state": null,
                "address_zip": null,
                "address_zip_check": null,
                "brand": "Visa",
                "country": "US",
                "customer": "cus_ErvvxFFtXEYS88",
                "cvc_check": null,
                "dynamic_last4": null,
                "exp_month": 4,
                "exp_year": 2020,
                "fingerprint": "lj2y3c7tkwljiZH1",
                "funding": "credit",
                "last4": "4242",
                "metadata": {},
                "name": null,
                "tokenization_method": null
            },
            "source_transfer": null,
            "statement_descriptor": null,
            "status": "succeeded",
            "transfer_data": null,
            "transfer_group": null
        },
        {
            "id": "ch_1ENrMEFtiYWtPmMq8EpDTqDQ",
            "object": "charge",
            "amount": 3000,
            "amount_refunded": 0,
            "application": null,
            "application_fee": null,
            "application_fee_amount": null,
            "balance_transaction": "txn_1ENrMFFtiYWtPmMqTkO5FcJy",
            "billing_details": {
                "address": {
                    "city": null,
                    "country": null,
                    "line1": null,
                    "line2": null,
                    "postal_code": null,
                    "state": null
                },
                "email": null,
                "name": null,
                "phone": null
            },
            "captured": true,
            "created": 1554944738,
            "currency": "usd",
            "customer": "cus_EraLVVmnYUoM2i",
            "description": "Your payment receipt from the LAD Network",
            "destination": null,
            "dispute": null,
            "failure_code": null,
            "failure_message": null,
            "fraud_details": {},
            "invoice": null,
            "livemode": false,
            "metadata": {},
            "on_behalf_of": null,
            "order": null,
            "outcome": {
                "network_status": "approved_by_network",
                "reason": null,
                "risk_level": "normal",
                "risk_score": 18,
                "seller_message": "Payment complete.",
                "type": "authorized"
            },
            "paid": true,
            "payment_intent": null,
            "payment_method": "card_1ENrAaFtiYWtPmMqkd7lIBEt",
            "payment_method_details": {
                "card": {
                    "brand": "visa",
                    "checks": {
                        "address_line1_check": null,
                        "address_postal_code_check": null,
                        "cvc_check": null
                    },
                    "country": "US",
                    "exp_month": 4,
                    "exp_year": 2020,
                    "fingerprint": "lj2y3c7tkwljiZH1",
                    "funding": "credit",
                    "last4": "4242",
                    "three_d_secure": null,
                    "wallet": null
                },
                "type": "card"
            },
            "receipt_email": "cjbtantay@gmail.com",
            "receipt_number": null,
            "receipt_url": "https://pay.stripe.com/receipts/acct_1E88ZVFtiYWtPmMq/ch_1ENrMEFtiYWtPmMq8EpDTqDQ/rcpt_EraXMPaZ8tOUYYypRf06c7fVz0dBWNJ",
            "refunded": false,
            "refunds": {
                "object": "list",
                "data": [],
                "has_more": false,
                "total_count": 0,
                "url": "/v1/charges/ch_1ENrMEFtiYWtPmMq8EpDTqDQ/refunds"
            },
            "review": null,
            "shipping": null,
            "source": {
                "id": "card_1ENrAaFtiYWtPmMqkd7lIBEt",
                "object": "card",
                "address_city": null,
                "address_country": null,
                "address_line1": null,
                "address_line1_check": null,
                "address_line2": null,
                "address_state": null,
                "address_zip": null,
                "address_zip_check": null,
                "brand": "Visa",
                "country": "US",
                "customer": "cus_EraLVVmnYUoM2i",
                "cvc_check": null,
                "dynamic_last4": null,
                "exp_month": 4,
                "exp_year": 2020,
                "fingerprint": "lj2y3c7tkwljiZH1",
                "funding": "credit",
                "last4": "4242",
                "metadata": {},
                "name": null,
                "tokenization_method": null
            },
            "source_transfer": null,
            "statement_descriptor": null,
            "status": "succeeded",
            "transfer_data": null,
            "transfer_group": null
        },
        {
            "id": "ch_1ENrAkFtiYWtPmMqyI4dsVSP",
            "object": "charge",
            "amount": 1000,
            "amount_refunded": 0,
            "application": null,
            "application_fee": null,
            "application_fee_amount": null,
            "balance_transaction": "txn_1ENrAkFtiYWtPmMqCHqeQtUL",
            "billing_details": {
                "address": {
                    "city": null,
                    "country": null,
                    "line1": null,
                    "line2": null,
                    "postal_code": null,
                    "state": null
                },
                "email": null,
                "name": null,
                "phone": null
            },
            "captured": true,
            "created": 1554944026,
            "currency": "usd",
            "customer": "cus_EraLVVmnYUoM2i",
            "description": "Your payment receipt from the LAD Network",
            "destination": null,
            "dispute": null,
            "failure_code": null,
            "failure_message": null,
            "fraud_details": {},
            "invoice": null,
            "livemode": false,
            "metadata": {},
            "on_behalf_of": null,
            "order": null,
            "outcome": {
                "network_status": "approved_by_network",
                "reason": null,
                "risk_level": "normal",
                "risk_score": 6,
                "seller_message": "Payment complete.",
                "type": "authorized"
            },
            "paid": true,
            "payment_intent": null,
            "payment_method": "card_1ENrAaFtiYWtPmMqkd7lIBEt",
            "payment_method_details": {
                "card": {
                    "brand": "visa",
                    "checks": {
                        "address_line1_check": null,
                        "address_postal_code_check": null,
                        "cvc_check": null
                    },
                    "country": "US",
                    "exp_month": 4,
                    "exp_year": 2020,
                    "fingerprint": "lj2y3c7tkwljiZH1",
                    "funding": "credit",
                    "last4": "4242",
                    "three_d_secure": null,
                    "wallet": null
                },
                "type": "card"
            },
            "receipt_email": "cjbtantay@gmail.com",
            "receipt_number": "1954-6674",
            "receipt_url": "https://pay.stripe.com/receipts/acct_1E88ZVFtiYWtPmMq/ch_1ENrAkFtiYWtPmMqyI4dsVSP/rcpt_EraLkb1cnfIorNGet0i5X8kC6p3wXlH",
            "refunded": false,
            "refunds": {
                "object": "list",
                "data": [],
                "has_more": false,
                "total_count": 0,
                "url": "/v1/charges/ch_1ENrAkFtiYWtPmMqyI4dsVSP/refunds"
            },
            "review": null,
            "shipping": null,
            "source": {
                "id": "card_1ENrAaFtiYWtPmMqkd7lIBEt",
                "object": "card",
                "address_city": null,
                "address_country": null,
                "address_line1": null,
                "address_line1_check": null,
                "address_line2": null,
                "address_state": null,
                "address_zip": null,
                "address_zip_check": null,
                "brand": "Visa",
                "country": "US",
                "customer": "cus_EraLVVmnYUoM2i",
                "cvc_check": null,
                "dynamic_last4": null,
                "exp_month": 4,
                "exp_year": 2020,
                "fingerprint": "lj2y3c7tkwljiZH1",
                "funding": "credit",
                "last4": "4242",
                "metadata": {},
                "name": null,
                "tokenization_method": null
            },
            "source_transfer": null,
            "statement_descriptor": null,
            "status": "succeeded",
            "transfer_data": null,
            "transfer_group": null
        },
        {
            "id": "ch_1ENlWAFtiYWtPmMqPFUxTXy6",
            "object": "charge",
            "amount": 54,
            "amount_refunded": 0,
            "application": null,
            "application_fee": null,
            "application_fee_amount": null,
            "balance_transaction": "txn_1ENlWAFtiYWtPmMq1DQrsIeG",
            "billing_details": {
                "address": {
                    "city": null,
                    "country": null,
                    "line1": null,
                    "line2": null,
                    "postal_code": null,
                    "state": null
                },
                "email": null,
                "name": null,
                "phone": null
            },
            "captured": true,
            "created": 1554922290,
            "currency": "usd",
            "customer": "cus_ErUVGf84EA1899",
            "description": "Your payment receipt from the LAD Network",
            "destination": null,
            "dispute": null,
            "failure_code": null,
            "failure_message": null,
            "fraud_details": {},
            "invoice": null,
            "livemode": false,
            "metadata": {},
            "on_behalf_of": null,
            "order": null,
            "outcome": {
                "network_status": "approved_by_network",
                "reason": null,
                "risk_level": "normal",
                "risk_score": 11,
                "seller_message": "Payment complete.",
                "type": "authorized"
            },
            "paid": true,
            "payment_intent": null,
            "payment_method": "card_1ENlW8FtiYWtPmMqkaebVvOd",
            "payment_method_details": {
                "card": {
                    "brand": "visa",
                    "checks": {
                        "address_line1_check": null,
                        "address_postal_code_check": null,
                        "cvc_check": null
                    },
                    "country": "US",
                    "exp_month": 4,
                    "exp_year": 2020,
                    "fingerprint": "lj2y3c7tkwljiZH1",
                    "funding": "credit",
                    "last4": "4242",
                    "three_d_secure": null,
                    "wallet": null
                },
                "type": "card"
            },
            "receipt_email": "elkhoudh@gmail.com",
            "receipt_number": "1616-3136",
            "receipt_url": "https://pay.stripe.com/receipts/acct_1E88ZVFtiYWtPmMq/ch_1ENlWAFtiYWtPmMqPFUxTXy6/rcpt_ErUVLLPK6zjBexlfvKZaLS6QhJa1N39",
            "refunded": false,
            "refunds": {
                "object": "list",
                "data": [],
                "has_more": false,
                "total_count": 0,
                "url": "/v1/charges/ch_1ENlWAFtiYWtPmMqPFUxTXy6/refunds"
            },
            "review": null,
            "shipping": null,
            "source": {
                "id": "card_1ENlW8FtiYWtPmMqkaebVvOd",
                "object": "card",
                "address_city": null,
                "address_country": null,
                "address_line1": null,
                "address_line1_check": null,
                "address_line2": null,
                "address_state": null,
                "address_zip": null,
                "address_zip_check": null,
                "brand": "Visa",
                "country": "US",
                "customer": "cus_ErUVGf84EA1899",
                "cvc_check": null,
                "dynamic_last4": null,
                "exp_month": 4,
                "exp_year": 2020,
                "fingerprint": "lj2y3c7tkwljiZH1",
                "funding": "credit",
                "last4": "4242",
                "metadata": {},
                "name": null,
                "tokenization_method": null
            },
            "source_transfer": null,
            "statement_descriptor": null,
            "status": "succeeded",
            "transfer_data": null,
            "transfer_group": null
        },
        {
            "id": "ch_1ENXbwFtiYWtPmMqR0sDfS8v",
            "object": "charge",
            "amount": 140,
            "amount_refunded": 0,
            "application": null,
            "application_fee": null,
            "application_fee_amount": null,
            "balance_transaction": "txn_1ENXbwFtiYWtPmMqQRrtRn92",
            "billing_details": {
                "address": {
                    "city": null,
                    "country": null,
                    "line1": null,
                    "line2": null,
                    "postal_code": null,
                    "state": null
                },
                "email": null,
                "name": null,
                "phone": null
            },
            "captured": true,
            "created": 1554868832,
            "currency": "usd",
            "customer": "cus_ErFhTaJn1bp7NT",
            "description": "Your payment receipt from the LAD Network",
            "destination": null,
            "dispute": null,
            "failure_code": null,
            "failure_message": null,
            "fraud_details": {},
            "invoice": null,
            "livemode": false,
            "metadata": {},
            "on_behalf_of": null,
            "order": null,
            "outcome": {
                "network_status": "approved_by_network",
                "reason": null,
                "risk_level": "normal",
                "risk_score": 35,
                "seller_message": "Payment complete.",
                "type": "authorized"
            },
            "paid": true,
            "payment_intent": null,
            "payment_method": "card_1ENXCXFtiYWtPmMqjPbShZWW",
            "payment_method_details": {
                "card": {
                    "brand": "visa",
                    "checks": {
                        "address_line1_check": null,
                        "address_postal_code_check": null,
                        "cvc_check": null
                    },
                    "country": "US",
                    "exp_month": 4,
                    "exp_year": 2020,
                    "fingerprint": "lj2y3c7tkwljiZH1",
                    "funding": "credit",
                    "last4": "4242",
                    "three_d_secure": null,
                    "wallet": null
                },
                "type": "card"
            },
            "receipt_email": "elkhoudh@gmail.com",
            "receipt_number": null,
            "receipt_url": "https://pay.stripe.com/receipts/acct_1E88ZVFtiYWtPmMq/ch_1ENXbwFtiYWtPmMqR0sDfS8v/rcpt_ErG8yiwZIsF2fEN1kK5b7mc9GPbwkgA",
            "refunded": false,
            "refunds": {
                "object": "list",
                "data": [],
                "has_more": false,
                "total_count": 0,
                "url": "/v1/charges/ch_1ENXbwFtiYWtPmMqR0sDfS8v/refunds"
            },
            "review": null,
            "shipping": null,
            "source": {
                "id": "card_1ENXCXFtiYWtPmMqjPbShZWW",
                "object": "card",
                "address_city": null,
                "address_country": null,
                "address_line1": null,
                "address_line1_check": null,
                "address_line2": null,
                "address_state": null,
                "address_zip": null,
                "address_zip_check": null,
                "brand": "Visa",
                "country": "US",
                "customer": "cus_ErFhTaJn1bp7NT",
                "cvc_check": null,
                "dynamic_last4": null,
                "exp_month": 4,
                "exp_year": 2020,
                "fingerprint": "lj2y3c7tkwljiZH1",
                "funding": "credit",
                "last4": "4242",
                "metadata": {},
                "name": null,
                "tokenization_method": null
            },
            "source_transfer": null,
            "statement_descriptor": null,
            "status": "succeeded",
            "transfer_data": null,
            "transfer_group": null
        },
        {
            "id": "ch_1ENWyFFtiYWtPmMqc9V0nyHp",
            "object": "charge",
            "amount": 9500,
            "amount_refunded": 0,
            "application": null,
            "application_fee": null,
            "application_fee_amount": null,
            "balance_transaction": "txn_1ENWyFFtiYWtPmMqZ1PWOQW6",
            "billing_details": {
                "address": {
                    "city": null,
                    "country": null,
                    "line1": null,
                    "line2": null,
                    "postal_code": null,
                    "state": null
                },
                "email": null,
                "name": null,
                "phone": null
            },
            "captured": true,
            "created": 1554866371,
            "currency": "usd",
            "customer": "cus_Eqm6R4jxfWZYit",
            "description": "Your payment receipt from the LAD Network",
            "destination": null,
            "dispute": null,
            "failure_code": null,
            "failure_message": null,
            "fraud_details": {},
            "invoice": null,
            "livemode": false,
            "metadata": {},
            "on_behalf_of": null,
            "order": null,
            "outcome": {
                "network_status": "approved_by_network",
                "reason": null,
                "risk_level": "normal",
                "risk_score": 0,
                "seller_message": "Payment complete.",
                "type": "authorized"
            },
            "paid": true,
            "payment_intent": null,
            "payment_method": "card_1EN4Y8FtiYWtPmMqFZX3gM7a",
            "payment_method_details": {
                "card": {
                    "brand": "visa",
                    "checks": {
                        "address_line1_check": null,
                        "address_postal_code_check": null,
                        "cvc_check": null
                    },
                    "country": "US",
                    "exp_month": 4,
                    "exp_year": 2020,
                    "fingerprint": "lj2y3c7tkwljiZH1",
                    "funding": "credit",
                    "last4": "4242",
                    "three_d_secure": null,
                    "wallet": null
                },
                "type": "card"
            },
            "receipt_email": "KIERANVIEIRA@live.COM",
            "receipt_number": null,
            "receipt_url": "https://pay.stripe.com/receipts/acct_1E88ZVFtiYWtPmMq/ch_1ENWyFFtiYWtPmMqc9V0nyHp/rcpt_ErFTo97IWpoI0p4TZ5YY0nlUhr4fO7M",
            "refunded": false,
            "refunds": {
                "object": "list",
                "data": [],
                "has_more": false,
                "total_count": 0,
                "url": "/v1/charges/ch_1ENWyFFtiYWtPmMqc9V0nyHp/refunds"
            },
            "review": null,
            "shipping": null,
            "source": {
                "id": "card_1EN4Y8FtiYWtPmMqFZX3gM7a",
                "object": "card",
                "address_city": null,
                "address_country": null,
                "address_line1": null,
                "address_line1_check": null,
                "address_line2": null,
                "address_state": null,
                "address_zip": null,
                "address_zip_check": null,
                "brand": "Visa",
                "country": "US",
                "customer": "cus_Eqm6R4jxfWZYit",
                "cvc_check": null,
                "dynamic_last4": null,
                "exp_month": 4,
                "exp_year": 2020,
                "fingerprint": "lj2y3c7tkwljiZH1",
                "funding": "credit",
                "last4": "4242",
                "metadata": {},
                "name": null,
                "tokenization_method": null
            },
            "source_transfer": null,
            "statement_descriptor": null,
            "status": "succeeded",
            "transfer_data": null,
            "transfer_group": null
        },
        {
            "id": "ch_1ENWm7FtiYWtPmMq7SfJcJUE",
            "object": "charge",
            "amount": 4000,
            "amount_refunded": 0,
            "application": null,
            "application_fee": null,
            "application_fee_amount": null,
            "balance_transaction": "txn_1ENWm7FtiYWtPmMqAHOZw53d",
            "billing_details": {
                "address": {
                    "city": null,
                    "country": null,
                    "line1": null,
                    "line2": null,
                    "postal_code": null,
                    "state": null
                },
                "email": null,
                "name": null,
                "phone": null
            },
            "captured": true,
            "created": 1554865619,
            "currency": "usd",
            "customer": "cus_Eqm6R4jxfWZYit",
            "description": "Your payment receipt from the LAD Network",
            "destination": null,
            "dispute": null,
            "failure_code": null,
            "failure_message": null,
            "fraud_details": {},
            "invoice": null,
            "livemode": false,
            "metadata": {},
            "on_behalf_of": null,
            "order": null,
            "outcome": {
                "network_status": "approved_by_network",
                "reason": null,
                "risk_level": "normal",
                "risk_score": 27,
                "seller_message": "Payment complete.",
                "type": "authorized"
            },
            "paid": true,
            "payment_intent": null,
            "payment_method": "card_1EN4Y8FtiYWtPmMqFZX3gM7a",
            "payment_method_details": {
                "card": {
                    "brand": "visa",
                    "checks": {
                        "address_line1_check": null,
                        "address_postal_code_check": null,
                        "cvc_check": null
                    },
                    "country": "US",
                    "exp_month": 4,
                    "exp_year": 2020,
                    "fingerprint": "lj2y3c7tkwljiZH1",
                    "funding": "credit",
                    "last4": "4242",
                    "three_d_secure": null,
                    "wallet": null
                },
                "type": "card"
            },
            "receipt_email": "KIERANVIEIRA@live.COM",
            "receipt_number": null,
            "receipt_url": "https://pay.stripe.com/receipts/acct_1E88ZVFtiYWtPmMq/ch_1ENWm7FtiYWtPmMq7SfJcJUE/rcpt_ErFGGm6I7ofqJLvyPwVVHAW5yBZc45j",
            "refunded": false,
            "refunds": {
                "object": "list",
                "data": [],
                "has_more": false,
                "total_count": 0,
                "url": "/v1/charges/ch_1ENWm7FtiYWtPmMq7SfJcJUE/refunds"
            },
            "review": null,
            "shipping": null,
            "source": {
                "id": "card_1EN4Y8FtiYWtPmMqFZX3gM7a",
                "object": "card",
                "address_city": null,
                "address_country": null,
                "address_line1": null,
                "address_line1_check": null,
                "address_line2": null,
                "address_state": null,
                "address_zip": null,
                "address_zip_check": null,
                "brand": "Visa",
                "country": "US",
                "customer": "cus_Eqm6R4jxfWZYit",
                "cvc_check": null,
                "dynamic_last4": null,
                "exp_month": 4,
                "exp_year": 2020,
                "fingerprint": "lj2y3c7tkwljiZH1",
                "funding": "credit",
                "last4": "4242",
                "metadata": {},
                "name": null,
                "tokenization_method": null
            },
            "source_transfer": null,
            "statement_descriptor": null,
            "status": "succeeded",
            "transfer_data": null,
            "transfer_group": null
        }
    ]
}
```



#### Private Route middleware
`500 error ❌`
```
{
    "message": "You need to passed Headers !"
}
```

#### ️DB Schema
![](assets/dbSchema.png)



### Authors 
- John Benedict Miranda [Github](https://github.com/john2796) , [linkedin](https://www.linkedin.com/in/john-benedict-miranda-7b2357180/)
- Hamza Elkhoudiri [Github](https://github.com/elkhoudh) , [linkedin](https://www.linkedin.com/in/hamza-elkhoudiri-a606aa162/)
- Max McFerren [Github](https://github.com/mcferrenm) , [linkedin](https://www.linkedin.com/in/max-mcferren-423b75115/)
- Kieran Vieira [Github](https://github.com/KieranVieira) , [linkedin](https://www.linkedin.com/in/kieran-vieira/)
- Jordan Marsaw [Github](https://github.com/blokboy) 


