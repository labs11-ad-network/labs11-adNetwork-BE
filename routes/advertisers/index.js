const route = require("express").Router();

route.get("/", (req, res) => {
  res.json("ADVERTISERS ROUTE");
});

module.exports = route;
