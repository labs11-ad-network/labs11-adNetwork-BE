const route = require('express').Router()
const models = require('../../common/helpers')
const pubKey = process.env.PUBLIC_KEY
const stripe = require("stripe")(process.env.SECRET_KEY);

route.get('/', (req, res) => {
  res.render('index.pug', { pubKey })
})

route.post("/create_customer", (req, res) => {
  // Create a one time use token from User Payment Info entered on front end
  stripe.tokens.create({
                        card: {
                        number: req.body.number || '4242424242424242',
                        exp_month: req.body.exp_month || 12,
                        exp_year: req.body.exp_year || 2020,
                        cvc: req.body.cvc || '123'
                        }
  })
  .then(token => {
    res.status(200).json({ message: 'Success!', token })
  })
  .catch(e => res.status(500).json(e))

  // Create a particular account type for a user
  stripe.customers.create({
    account_balance: req.body.amount || 0,
    coupon: req.body.coupon || null,
    email: req.body.stripeEmail,
    description: req.body.description || `Stripe Account for ${this.email}`,
    source: req.body.stripeToken || cust_source.id
  })
  .then(customer =>
    res.status(200).json(customer)
  )
  .catch(e => res.status(404).json(e))
  });

  // Charge the customer, but gonna set this to a different function to split
  stripe.charges.create({
    amount,
    description: "Sample Charge",
    currency: "USD",
    customer: customer.id || 3
  })
})





module.exports = route
