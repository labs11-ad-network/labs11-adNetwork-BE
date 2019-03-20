const route = require("express").Router();

route.get("/", (req, res) => {
  res.json("AUTH ROUTE");
});

module.exports = route;
