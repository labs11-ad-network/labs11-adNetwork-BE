const route = require("express").Router();
const models = require("../../common/helpers");
const { authenticate } = require('../../common/authentication')
const db = require('../../data/dbConfig')
const cloudinary = require("cloudinary");
const multipart = require("connect-multiparty")();

cloudinary.config({
  cloud_name: "dxvyzmvhi",
  api_key: "672796748434519",
  api_secret: "Jf7IESazEon7JKlD9dd8fkMgESk"
});



// @route    GET api/users
// @desc     Get current user
// @Access   Private
route.get("/", authenticate, async (req, res) => {
  const { id, sub, email, acct_type } = req.decoded;

  try {
    let users = await db.select().from('users').where({ email }).andWhere({ sub })
    if (users) {
      const result = await users.map(async (user) => {
        const offers = await db.select().from('offers');
        const ads = await db.select().from('ads');
        let agreements = await db
          .select()
          .from("agreements")
          .where({ affiliate_id: id })
          .andWhere({ offer_id: user.id });


        user.offers = offers.length
        user.ads = ads.length
        user.agreements = acct_type === "affiliate" ? agreements.length : 0
        user.agreement_test = agreements

        return user
      })

      Promise.all(result).then(completed => {
        users = completed
        res.status(200).json(users);
      })

    } else {
      res.status(500).json({ message: "Users do not exist." });
    }
  } catch ({ message }) {
    res.status(404).json({ message });
  }
});

// @route    GET api/users
// @desc     Get user by id 
// @Access   Private
route.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await models.findBy("users", { id });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(500).json({ message: "User does not exist." });
    }
  } catch ({ message }) {
    res.status(404).json({ message });
  }
});


// @route    GET api/users
// @desc     update user info
// @Access   Private
// {
//   "id": 5,
//   "name": "John Benedict Miranda",
//   "email": "jbmiranda22796@gmail.com",
//   "image_url": "https://lh5.googleusercontent.com/-WTtT3UkmeXQ/AAAAAAAAAAI/AAAAAAAAAAA/ACHi3rfpqZdcTynfeLYXn-0kPGHbeWLerA/mo/photo.jpg",
//   "nickname": "jbmiranda22796",
//   "sub": "google-oauth2|114122358554022059970",
//   "acct_type": "advertiser",
//   "phone": null,
//   "stripe_cust_id": null
// }

route.put("/", authenticate, multipart, async (req, res) => {
  const { email, sub } = req.body;
  const { id } = req.params

  if (email || sub) {
    return res.status(500).json({ message: 'updating email and sub is not allowed' })
  }
  console.log('req.files.path', req.files.image.path);

  try {
    // ------------- cloudinary - ---------
    cloudinary.v2.uploader.upload(req.files.image.path, async (error, result) => {
      if (error) return res.status(500).json({ message: error });
      console.log('----- result ------', result);

      // ------------- update - ---------
      const success = await models.update("users", id, {
        ...req.body,
        image_url: result.secure_url
      });
      if (success) {
        const user = await models.findBy("users", { id });
        res.status(200).json({ user, message: "User edited successfully." });
      } else {
        res
          .status(404)
          .json({ message: "There was an issue editing this user." });
      }
    });


  } catch ({ message }) {
    res.status(500).json({ message });
  }
});



// @route    GET api/user
// @desc     delete user account
// @Access   Public
route.delete("/", authenticate, async (req, res) => {

  const { id } = req.decoded
  try {
    const success = await models.remove("users", id);
    if (success) {
      res.status(200).json({ message: "User deleted successfully." });
    } else {
      res
        .status(500)
        .json({ message: "There was an issue deleting this user." });
    }
  } catch ({ message }) {
    res.status(404).json({ message });
  }
});



module.exports = route;
