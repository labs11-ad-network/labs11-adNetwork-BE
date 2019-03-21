const route = require("express").Router();
const models = require("../../common/helpers");
const { authenticate } = require("../../common/authentication");

route.get("/", async (req, res) => {
  try {
    const ads = await models.get("ads");
    res.json(ads);
  } catch (error) {
    res.status(500).json(error);
  }
});

route.post("/", async (req, res) => {
  try {
    const [newAd] = await models.add("ads", req.body);
    if (!newAd) return res.status(500).json({ message: "Failed to add ad" });
    const ad = await models.findBy("ads", { id: newAd });
    res.json(ad);
  } catch (error) {
    res.status(500).json(error);
  }
});

route.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleteAd = await models.remove("ads", id);
    if (!deleteAd)
      return res.status(400).json({ message: "Failed to delete ad" });
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error });
  }
});

route.get("/myads", authenticate, async (req, res) => {
  const { id } = req.decoded;

  try {
    const myAds = await models.findAllBy("ads", { user_id: id });
    res.json(myAds);
  } catch (error) {
    res.status(500).json(error);
  }
});

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

module.exports = route;
