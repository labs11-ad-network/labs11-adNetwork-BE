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
const ads = require("../routes/mockups");
const users = require("../routes/users");
const analytics = require("../routes/analytics");


const configureMiddleware = server => {
  server.use(json);
  server.use(helmet());
  server.use(morgan("dev"));
  server.use(cors());
  server.use(require("body-parser").urlencoded({extended: false}));
  server.use("/api/admin", admin);
  server.use("/api/advertisers", advertisers);
  server.use("/api/affiliates", affiliates);
  server.use("/api/agreements", agreements);
  server.use("/api/auth", auth);
  server.use("/api/offers", offers);
  server.use("/api/ads", ads);
  server.use("/api/analytics", analytics);
  server.use("/api/users", users);
//   server.use("/api/checkout", stripe_routes)
};

module.exports = {
  configureMiddleware
};
