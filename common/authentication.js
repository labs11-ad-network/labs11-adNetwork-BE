const jwt = require("jsonwebtoken");
const jwtDecode = require("jwt-decode");

const models = require("../common/helpers");
const errorHelper = require("../error-helper/errorHelper");

// Authentication middleware
const authenticate = async (req, res, next) => {
  const token = req.get("Authorization");
  try {
    if (token) {
      const decoded = jwtDecode(token);
      const user = await models.findBy("users", {
        email: decoded.email,
        sub: decoded.sub
      });

      if (user) {
        req.decoded = user;
        next();
      } else {
        res.status(401).json({ message: "You are not authorized" });
      }
    } else {
      res.status(401).json({ message: "You are not authorized" });
    }
  } catch (error) {
    return errorHelper(500, error, res);
  }
};

module.exports = {
  authenticate
};
