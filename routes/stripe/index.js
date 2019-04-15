require("dotenv").config();
const route = require("express").Router();
const models = require("../../common/helpers");
const request = require("request");
const stripe = require("stripe")(process.env.SECRET_KEY);

const { authenticate } = require("../../common/authentication");

// @route    /api/checkout/connect_customer
// @desc     Post StripeConnect/create
// @Access   Public
route.post("/connect_customer", authenticate, async (req, res) => {
  const { code } = req.body;
  const { id } = req.decoded;

  if (!code) return res.status(422).json({ message: "Code required" });

  try {
    const _customer = await models.findBy("users", { id });
    if (!_customer)
      return res.status(404).json({ message: "Customer not found" });

    const options = {
      method: "POST",
      url: "https://connect.stripe.com/oauth/token",
      headers: {
        "cache-control": "no-cache",
        "content-type":
          "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW"
      },
      formData: {
        client_secret: process.env.SECRET_KEY,
        code,
        grant_type: "authorization_code"
      }
    };

    request(options, async (error, response, body) => {
      if (error) throw new Error(error);
      if (JSON.parse(body).stripe_user_id) {
        const update = await models.update("users", id, {
          stripe_payout_id: JSON.parse(body).stripe_user_id
        });

        if (!update) return res.status(500).json({ message: "server error" });
        const updatedCustomer = await models.findBy("users", { id });
        res.json(updatedCustomer);
      } else {
        res.status(500).json({ message: "Failed to connect stripe" });
      }
    });
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

// @route    /api/checkout/create_customer
// @desc     Post Cosumter/create
// @Access   Private
route.post("/create_customer", authenticate, async (req, res) => {
  try {
    const customer = await stripe.customers.create({
      account_balance: req.body.amount || 0,
      coupon: req.body.coupon || null,
      email: req.body.stripeEmail || req.decoded.email,
      description:
        req.body.description ||
        `Stripe Account for ${req.body.stripeEmail || req.decoded.email}`,
      source: req.body.stripeToken || "tok_visa"
    });

    if (customer.id) {
      const success = await models.updateStripe(
        "users",
        { email: customer.email, id: req.decoded.id },
        { stripe_cust_id: customer.id }
      );
      res
        .status(201)
        .json({ message: "Customer created successfully", customer });
    } else {
      res
        .status(500)
        .json({ message: "There was an issue creating the customer." });
    }
  } catch ({ message }) {
    res.status(404).json({ message });
  }
});

// @route    /api/checkout/charge_customer
// @desc     POST charge customer
// @Access   Private
route.post("/charge_customer", authenticate, async (req, res) => {
  const _customer = await models.findBy("users", { id: req.decoded.id });

  try {
    const charge = await stripe.charges.create({
      amount: Math.floor(Math.abs(_customer.amount) * 100) || 0,
      currency: "usd",
      customer: _customer.stripe_cust_id,
      receipt_email: _customer.email,
      description: "Your payment receipt from the LAD Network"
    });

    await models.update("users", req.decoded.id, {
      amount: 0
    });
    res.status(200).json(charge);
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

// @route    /api/checkout/payout
// @desc     POST payout customer (affiliate)
// @Access   Private
route.post("/payout", authenticate, async (req, res) => {
  const _customer = await models.findBy("users", { id: req.decoded.id });

  if (_customer.acct_type !== "affiliate")
    return res.status(400).json({ message: "You must be an affiliate" });

  try {
    if (_customer.amount === 0) {
      return res
        .status(400)
        .json({ message: "You can not receive an amount of 0" });
    } else {
      stripe.transfers
        .create({
          amount: Math.floor(_customer.amount * 100),
          currency: "usd",
          destination: _customer.stripe_payout_id
        })
        .then(async transfer => {
          if (transfer) {
            const success = await models.update("users", req.decoded.id, {
              amount: 0
            });
            res.json(transfer);
          } else {
            res.status(500).json({ message: "Failed to payout" });
          }
        });
    }
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

// @route    /api/checkout/payout
// @desc     GET payouts for customer
// @Access   Private
route.get("/payout", authenticate, async (req, res) => {
  const _customer = await models.findBy("users", { id: req.decoded.id });

  try {
    stripe.transfers.list(
      { destination: _customer.stripe_payout_id },
      async (err, transfers) => {
        if (err) return res.status(500).json({ message: err });
        res.json({ payouts: transfers.data });
      }
    );
  } catch ({ message }) {
    res.json({ message });
  }
});

// @route    /api/checkout/payments
// @desc     GET charge customer (advertiser)
// @Access   Private
route.get("/payments", authenticate, async (req, res) => {
  const _customer = await models.findBy("users", { id: req.decoded.id });

  try {
    await stripe.charges.list(
      { customer: _customer.stripe_user_id },
      (err, charges) => {
        if (err) return res.status(500).json({ message: err });
        res.json({ payments: charges.data });
      }
    );
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

module.exports = route;
