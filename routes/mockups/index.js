const route = require("express").Router();
const models = require("../../common/helpers");
const { authenticate } = require("../../common/authentication");
const db = require("../../data/dbConfig");
const cloudinary = require("cloudinary");
const multipart = require("connect-multiparty")();

cloudinary.config({
  cloud_name: "dxvyzmvhi",
  api_key: "672796748434519",
  api_secret: "Jf7IESazEon7JKlD9dd8fkMgESk"
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

  cloudinary.v2.uploader.upload(req.files.image.path, async (error, result) => {
    if (error) return res.status(500).json({ message: error });
    try {
      const [newAd] = await models.add("ads", {
        ...req.body,
        back_img: result.secure_url,
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

    if (!adCheck.length)
      return res
        .status(401)
        .json({ message: "You can not delete someone else's ad" });

    const deleteAd = await models.remove("ads", id);
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
    // const ad = await db.select('a.*', 'ag.*').from('ads as a').join('agreements as ag', 'ag.offer_id', 'a.offer_id')
    const ad = await models.findBy("ads", { id });
    console.log({ ad });
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
  const { acct_type } = req.decoded
  try {

    if (acct_type === 'affiliate') {
      const affiliateAds = await models.findAllBy("ads", { offer_id });
      if (!affiliateAds.length) return res.status(404).json({ message: "No Ads found" });
      return res.json(affiliateAds);
    } else {
      const ads = await models.findAllBy("ads", { user_id, offer_id });
      if (!ads.length) return res.status(404).json({ message: "No Ads found" });
      return res.json(ads);
    }
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

module.exports = route;

