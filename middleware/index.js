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

// -------------- passport oauth --------------
const usersV2 = require('../routes/authV2')
const cookieParser = require('cookie-parser');
const session = require('express-session');
const oauth = require('../routes/authV2/googleSetup')
// -------------- passport oauth --------------


const configureMiddleware = server => {
  server.use(json);
  server.use(helmet());
  server.use(morgan("dev"));
  // cookie
  server.use(cookieParser());
  server.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false
  }));
  // Passport/session initialization
  server.use(oauth.passport.initialize());
  server.use(oauth.passport.session());
  server.use(cors());
  server.use("/api/admin", admin);
  server.use("/api/advertisers", advertisers);
  server.use("/api/affiliates", affiliates);
  server.use("/api/agreements", agreements);
  server.use("/api/auth", auth);
  server.use("/api/offers", offers);
  server.use("/api/ads", ads);
  server.use("/api/analytics", analytics);
  server.use("/api/users", users);
  server.use("/api/usersV2", usersV2);
};

module.exports = {
  configureMiddleware
};
