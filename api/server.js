const express = require("express");
const { configureMiddleware } = require("../middleware");
const server = express();

configureMiddleware(server);

server.get("/", (req, res) => {
  res.send(
    '<h1 style="color: red; text-align: center; font-size: 40px;">LAD NETWORK SERVER</h1>'
  );
});

module.exports = server;
