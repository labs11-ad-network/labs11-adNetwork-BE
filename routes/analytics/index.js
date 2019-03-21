const route = require("express").Router();
const models = require("../../common/helpers");
const db = require("../../data/dbConfig");

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

route.get("/", async (req, res) => {
  const { action, started_at, ended_at, agreement_id } = req.query;
  try {
    if (action && started_at && ended_at) {
      const getActions = await db
        .select("*")
        .from("analytics")
        .where({ action })
        .where("created_at", ">=", started_at)
        .where("created_at", "<", ended_at);
      res.json(getActions);
    } else if (!action && started_at && ended_at) {
      const getActions = await db
        .select("*")
        .from("analytics")
        .where("created_at", ">=", started_at)
        .where("created_at", "<", ended_at);
      res.json(getActions);
    } else if (!started_at && !ended_at && action) {
      const getActions = await db
        .select("*")
        .from("analytics")
        .where({ action });
      res.json(getActions);
    } else {
      const analytics = await models.get("analytics");
      res.json(analytics);
    }
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

module.exports = route;
