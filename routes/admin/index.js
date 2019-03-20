const route = require("express").Router();

route.get("/", (req, res) => {
  res.json("ADMIN ROUTE");
});

module.exports = route;
