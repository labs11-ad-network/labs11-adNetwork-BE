const route = require("express").Router();

route.get("/", (req, res) => {
  res.json("AGREEMENTS ROUTE");
});

module.exports = route;
