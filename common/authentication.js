const jwt = require("jsonwebtoken");

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

const authenticate = (req, res, next) => {
  const token = req.get("Authorization");

  if (token) {
    jwt.verify(token, "SECRET KEY", (error, decoded) => {
      if (error) {
        res.status(401).json({ message: "You are not authorized" });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    res.status(401).json({ message: "You are not authorized" });
  }
};

module.exports = {
  genToken,
  authenticate
};
