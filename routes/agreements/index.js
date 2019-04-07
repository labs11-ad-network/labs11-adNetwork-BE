const route = require("express").Router();
const models = require("../../common/helpers");
const db = require("../../data/dbConfig");
const { authenticate } = require("../../common/authentication");
const { affiliateCheck } = require("../../common/roleCheck");
const emailer = require("../../common/mailer");

// @route    /api/agreements
// @desc     GET agreements
// @Access   Private
// Postman TESTED
route.get("/", authenticate, async (req, res) => {
  const affiliate_id = req.decoded.id;

  try {
    // const agreements = await models.findAllBy("agreements", { affiliate_id });
    const agreements = await db("agreements as ag")
      .join("offers as o", "ag.offer_id", "o.id")
      .where("affiliate_id", affiliate_id)
      .select("ag.*", "o.name");

    if (agreements) {
      res.status(200).json(agreements);
    } else {
      res
        .status(404)
        .json({ message: "There was an issue retrieving the offers." });
    }
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

// @route    /api/agreements/:id
// @desc     GET
// @Access   Private
// Postman TESTED
route.get("/:id", authenticate, async (req, res) => {
  const affiliate_id = req.decoded.id;
  const id = req.params.id;
  try {
    const agreement = await models.findBy("agreements", { id, affiliate_id });
    if (agreement) {
      res.status(200).json(agreement);
    } else {
      res
        .status(404)
        .json({ message: "There was no agreement found at that ID." });
    }
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

// Without authentication. When we add that we will refactor based on
// whether req.decoded.id is affiliate_id or advertiser_id
// Postman TESTED

// @route    /api/agreements
// @desc     post agreements
// @Access   PRivate
route.post("/", authenticate, affiliateCheck, async (req, res) => {
  const affiliate_id = req.decoded.id;
  if (!req.body.hasOwnProperty("offer_id")) {
    res.status(400).json({ message: "Required information is missing." });
  }

  try {
    const [id] = await models.add("agreements", {
      offer_id: req.body.offer_id,
      affiliate_id
    });
    if (id) {
      const agreement = await models.findBy("agreements", { id });
      const { email } = await models
        .getAdvertiserEmail(req.body.offer_id)
        .first();

      emailer(res, email);

      res.status(201).json(agreement);
    } else {
      res
        .status(404)
        .json({ message: "There was an issue adding agreement at that ID." });
    }
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

// @route    /api/agreements/:id
// @desc     PUT agreements
// @Access   Private
route.put("/:id", authenticate, async (req, res) => {
  const affiliate_id = req.decoded.id;

  const id = req.params.id;
  try {
    const agreement = await models.findBy("agreements", { id, affiliate_id });
    if (agreement) {
      const count = await models.update("agreements", id, {
        ...req.body
      });

      if (count > 0) {
        const updated = await models.findBy("agreements", { id });
        return res.status(200).json(updated);
      }
    } else {
      res
        .status(404)
        .json({ message: "There was no agreement found at that ID." });
    }
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

// @route    /api/agreements/:id
// @desc     delete agreements
// @Access   Private
// Postman TESTED
route.delete("/:id", authenticate, async (req, res) => {
  const affiliate_id = req.decoded.id;

  const id = req.params.id;
  try {
    const agreement = await models.findBy("agreements", { id, affiliate_id });

    if (!agreement)
      return res
        .status(401)
        .json({ message: "You are not allowed to delete this" });
    const success = await models.remove("agreements", id);
    if (success) {
      res.status(200).json({ message: "Agreement sucessfully deleted." });
    } else {
      res.status(404).json({
        message: "There was an issue deleting the agreement at that ID."
      });
    }
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

module.exports = route;
