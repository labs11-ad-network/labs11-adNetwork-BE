const route = require("express").Router();
const models = require("../../common/helpers");
const { authenticate } = require("../../common/authentication");
const db = require("../../data/dbConfig");
const cloudinary = require("cloudinary");
const multipart = require("connect-multiparty")();
const moment = require("moment");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_PUBKEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

// @route    GET /api/ads
// @desc     get all ads
// @Access   Private
route.get("/", authenticate, async (req, res) => {
  try {
    const ads = await models.get("ads");
    res.json(ads);
  } catch (error) {
    res.status(500).json(error);
  }
});

// @route    GET /api/ads
// @desc     Post an ads
// @Access   Private
route.post("/", authenticate, multipart, async (req, res) => {
  const user_id = req.decoded.id;
  cloudinary.v2.uploader.upload(req.body.image, async (error, result) => {
    if (error) return res.status(500).json({ message: error });
    try {
      const [newAd] = await models.add("ads", {
        ...req.body,
        image: result.secure_url,
        user_id
      });
      if (!newAd) return res.status(500).json({ message: "Failed to add ad" });
      const ad = await models.findBy("ads", { id: newAd });
      res.json(ad);
    } catch ({ message }) {
      res.status(500).json({ message });
    }
  });
});

// @route    GET /api/ads
// @desc     Delete an ads
// @Access   Public
route.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const user_id = req.decoded.id;
  try {
    const adCheck = await models.findBy("ads", { id, user_id });

    if (!adCheck)
      return res
        .status(401)
        .json({ message: "You can not delete someone else's ad" });

    const deleteAd = await models.removeAd("ads", { id, user_id });
    if (!deleteAd)
      return res.status(400).json({ message: "Failed to delete ad" });
    res.json({ success: true, id });
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

// @route    GET /api/ads/myads
// @desc     get all my ads
// @Access   Private
route.get("/myads", authenticate, async (req, res) => {
  const user_id = req.decoded.id;

  try {
    const myAds = await models.findAllBy("ads", { user_id });
    res.json(myAds);
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

// @route    GET /api/ads/:id
// @desc     Get ads by od
// @Access   Public
route.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const ad = await models.findBy("ads", { id });
    if (!ad) return res.status(404).json({ message: "No ads found" });
    res.json(ad);
  } catch (error) {
    res.status(500).json(error);
  }
});

// @route    GET /api/ads/offers/:id
// @desc     get offers by id
// @Access   Private
route.get("/offers/:id", authenticate, async (req, res) => {
  const user_id = req.decoded.id;
  const offer_id = req.params.id;
  const { acct_type } = req.decoded;
  try {
    if (acct_type === "affiliate") {
      const affiliateAds = await models
        .findAllBy("ads", { offer_id })
        .orderBy("id", "asc");
      if (!affiliateAds.length)
        return res.status(404).json({ message: "No Ads found" });
      return res.json(affiliateAds);
    } else {
      const ads = await models
        .findAllBy("ads", { user_id, offer_id })
        .orderBy("id", "asc");
      if (!ads.length) return res.status(404).json({ message: "No Ads found" });
      return res.json(ads);
    }
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

// @route    PUT /api/ads/:id
// @desc     update ads by id
// @Access   Private
route.put("/:id", authenticate, async (req, res) => {
  const user_id = req.decoded.id;
  const id = req.params.id;
  const { acct_type } = req.decoded;

  try {
    if (acct_type === "affiliate") {
      res.status(401).json({ message: "You can not edit ads" });
    } else {
      const ad = await models.findBy("ads", { id, user_id });
      if (!ad) {
        res.status(400).json({ message: "you can not edit this ad" });
      } else {
        const update = await db("ads")
          .where({ id, user_id })
          .update({ ...req.body });

        if (update) {
          res.json({ message: "Success" });
        } else {
          res.status(400).json({ message: "Failed to update" });
        }
      }
    }
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

// @route    GET /api/ads/allads/:id
// @desc     get accepted ads by affiliate_id
// @Access   Public
route.get("/allads/:id", async (req, res) => {
  const affiliate_id = req.params.id;

  try {
    const ads = await db("agreements as ag")
      .join("ads as ad", "ag.offer_id", "ad.offer_id")
      .select("ad.*", "ag.id as agreement_id")
      .where("affiliate_id", affiliate_id);

    res.json(ads);
  } catch ({ message }) {
    req.status(500).json({ message });
  }
});

module.exports = route;
