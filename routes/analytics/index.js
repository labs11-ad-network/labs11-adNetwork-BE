const route = require("express").Router();
const models = require("../../common/helpers");

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
  const { action, start_date, end_date, agreement_id } = req.query;

  try {
    const getAction = await models.queryByDate(
      "analytics",
      start_date,
      end_date
    );
    res.json(getAction);
    // if (action) {
    //   const getAction = await models.findAllBy("analytics", { action, updated_at: });
    //   res.json(getAction);
    // } else {
    //   const analytics = await models.get("analytics");
    //   res.json(analytics);
    // }
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

module.exports = route;
