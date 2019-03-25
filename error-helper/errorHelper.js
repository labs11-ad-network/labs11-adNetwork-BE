const sqlErrors = require('./sqlError');
const pgErrors = require("./postgresqlError")
module.exports = (code, error, res) => {
  res.status(code).json({
    // Numeric type -> error code; other types -> error message/object
    message: error && error.code ? pgErrors[error.code] : error,

  });
};