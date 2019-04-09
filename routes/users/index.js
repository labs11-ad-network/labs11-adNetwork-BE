const cloudinary = require("cloudinary");
const multipart = require("connect-multiparty")();
const route = require("express").Router();
const models = require("../../common/helpers");
const db = require("../../data/dbConfig");

const { authenticate } = require("../../common/authentication");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_PUBKEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

// @route     /api/users
// @desc     Get current user
// @Access   Private
route.get("/", authenticate, async (req, res) => {
  const { sub, email } = req.decoded;
  try {
    let users = await db('users')
                        .where({ email })
                        .andWhere({ sub });

      stripe.transfers.list({ limit: 10 }, async (err, transfers) => {
        if (err) {
          return res.status(500).json({ err });
        }
        
        const payout = transfers.data.filter(
          payout => payout.destination === _customer.stripe_payout_id
        );
                    
        const total_amount = payout.map(payout => payout.amount).reduce((a, b) => a + b) / 100;

        if(users) {
          const result = await users.map(async user => {
          const offers = await db("offers")
                                .where({ user_id: user.id });
          const ads = await db("ads")
                              .where({ user_id: user.id });
          const agreements = await db.select('ag.*', 'o.id as test_id')
                                    .from('agreements as ag')
                                    .join('offers as o','o.id','ag.offer_id' )
                                    .where({ affiliate_id: user.id });

          user.stripe_balance = total_amount;                           
          user.offers = offers.length;
          user.ads = ads.length;
          user.agreements = agreements.length;

          return user;
      });

      Promise.all(result).then(completed => {
        users = completed;
        res.status(200).json(users[0]);
      });
    } else {
      res.status(500).json({ message: "Users do not exist." });
    }
  })
  } catch({ message }) {
    res.status(404).json({ message });
  }
});

// @route     /api/users
// @desc     PUT user info
// @Access   Private
route.put("/", authenticate, multipart, async (req, res) => {
  const { id } = req.decoded;
  const { email, sub } = req.body;

  if (email || sub) {
    return res.status(500).json({ message: "Updating email and sub is not allowed." });
  }

  if (!req.files.image_url) {
    const success = await models.update("users", id, { ...req.body });
    if (success) {
      const user = await models.findBy("users", { id });
      res.status(204).json({ user, message: "User edited successfully." });
    } else {
      res.status(404).json({ message: "There was an issue editing this user." });
    }
  } else {
    // ------------- cloudinary - ---------
    cloudinary.v2.uploader.upload(
      req.files.image_url.path,
      async (error, result) => {
        if (error) return res.status(500).json({ error });
        try {
          // ------------- update - ---------
          const success = await models.update("users", id, {
            ...req.body,
            image_url: result.secure_url
          });

          if (success) {
            const user = await models.findBy("users", { id });
            res.status(204).json({ user, message: "User edited successfully." });
          } else {
            res.status(404).json({ message: "There was an issue editing this user." });
          }
        } catch ({ message }) {
          res.status(500).json({ message });
        }
      }
    );
  }
});

// @route    /api/user
// @desc     Delete user account
// @Access   Private
route.delete("/", authenticate, async (req, res) => {
  const { id } = req.decoded;
  try {
    const success = await models.remove("users", id);
    if (success) {
      res.status(204).json({ message: "User deleted successfully." });
    } else {
      res.status(500).json({ message: "There was an issue deleting this user." });
    }
  } catch ({ message }) {
    res.status(404).json({ message });
  }
});

module.exports = route;
