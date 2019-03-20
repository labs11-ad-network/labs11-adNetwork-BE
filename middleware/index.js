const json = require("express").json();
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const admin = require("../routes/admin");
const advertisers = require("../routes/advertisers");
const affiliates = require("../routes/affiliates");
const agreements = require("../routes/agreements");
const auth = require("../routes/auth");
const offers = require("../routes/offers");
const users = require("../routes/users");

const configureMiddleware = server => {
  server.use(json);
  server.use(helmet());
  server.use(morgan("dev"));
  server.use(cors());
  server.use("/api/admin", admin);
  server.use("/api/advertisers", advertisers);
  server.use("/api/affiliates", affiliates);
  server.use("/api/agreements", agreements);
  server.use("/api/auth", auth);
  server.use("/api/offers", offers);
  server.use("/api/users", users);
};

module.exports = {
  configureMiddleware
};
