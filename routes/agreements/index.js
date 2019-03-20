const route = require("express").Router();
const models = require("../../common/helpers");

route.get("/", async (req, res) => {
  const agreements = await models.get("agreements");
  res.status(200).json(agreements);
});

module.exports = route;
