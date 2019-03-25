const jwt = require("jsonwebtoken");
const models = require("../common/helpers");

const db = require('../data/dbConfig')

const jwtDecode = require('jwt-decode')
const errorHelper = require('../error-helper/errorHelper')
const genToken = user => {
  return new Promise((res, rej) => {
    jwt.sign(user, "SECRET KEY", { expiresIn: "1h" }, (err, token) => {
      if (err) {
        rej(err);
      } else {
        res(token);
      }
    });
  });
};


const authenticate = async (req, res, next) => {
  const token = req.get("Authorization");
  try {

    if (token) {
      const decoded = jwtDecode(token);
      const user = await db.select().from('usersV2').where({ email: decoded.email }).andWhere({ sub: decoded.sub }).first()

      if (user) {
        req.decoded = user;
        next()
      } else {
        res.status(401).json({ message: "You are not authorized" });
      }
    } else {
      res.status(401).json({ message: "You need to passed Headers !" });
    }

  } catch (error) {
    return errorHelper(500, error, res)
  }
};

module.exports = {
  genToken,
  authenticate,
};
