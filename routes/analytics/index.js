const route = require("express").Router();
const models = require("../../common/helpers");
const db = require("../../data/dbConfig");
const { authenticate } = require("../../common/authentication");

route.post("/", async (req, res) => {
  const { action, browser, ip, referrer, agreement_id } = req.body;

  try {
    const [enterAction] = await models.add("analytics", {
      action,
      browser,
      ip,
      referrer,
      agreement_id
    });
    if (!enterAction)
      return res.status(400).json({ message: "Failed to add action" });
    const analytics = await models.findBy("analytics", { id: enterAction });
    res.json(analytics);
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

route.get("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const user_id = req.decoded.id;

  try {
    // Route to GET analytics per offer query
    const analytics = await db
      .select("an.*", "ag.*")
      .from("analytics as an")
      .join("agreements as ag", "an.agreement_id", "ag.id")
      .where("ag.affiliate_id", user_id)
      .andWhere("ag.offer_id", id);

    res.json(analytics);
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

route.get("/", authenticate, async (req, res) => {
  const affiliate_id = req.decoded.id
  const { action, started_at, ended_at, agreement_id } = req.query;
  try {
    if (action && started_at && ended_at) {
      const getActions = await db.select('an.*', 'o.price_per_click', 'o.price_per_impression')
                                  .from('analytics as an')
                                  .join('agreements as ag', 'ag.affiliate_id', affiliate_id)
                                  .join('offers as o', 'o.id', 'ag.offer_id')
        .where("created_at", ">=", started_at)
        .where("created_at", "<", ended_at);
      res.json(getActions);
    } else if (!action && started_at && ended_at) {
      const getActions = await db.select('an.*', 'o.price_per_click', 'o.price_per_impression')
                                  .from('analytics as an')
                                  .join('agreements as ag', 'ag.affiliate_id', affiliate_id)
                                  .join('offers as o', 'o.id', 'ag.offer_id')
        .where("created_at", ">=", started_at)
        .where("created_at", "<", ended_at);
      res.json(getActions);
    } else if (!started_at && !ended_at && action) {
      const getActions = await db.select('an.*', 'o.price_per_click', 'o.price_per_impression')
                                  .from('analytics as an')
                                  .join('agreements as ag', 'ag.affiliate_id', affiliate_id)
                                  .join('offers as o', 'o.id', 'ag.offer_id')
        .where({ action });
      res.json(getActions);
    } else {
      const analytics  = await db.select('an.*', 'o.price_per_click', 'o.price_per_impression')
                                  .from('analytics as an')
                                  .join('agreements as ag', 'ag.affiliate_id', affiliate_id)
                                  .join('offers as o', 'o.id', 'ag.offer_id')
      res.json(analytics);
    }
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

module.exports = route;
