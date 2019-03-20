const route = require("express").Router();

route.get("/", (req, res) => {
  res.json("AFFILIATES ROUTE");
});

module.exports = route;
