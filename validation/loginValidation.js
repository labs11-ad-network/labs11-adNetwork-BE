const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateLogin(data) {
  let message = {};
  data.email = !isEmpty(data.email) ? data.email : "";


  // ----------------- has to be a valid email ----------------------
  if (!Validator.isEmail(data.email)) {
    message.email = "Email is invalid";
  }
  // ----------------- fields are required ----------------------
  if (Validator.isEmpty(data.email)) {
    message.email = "Email field is required";
  }

  return {
    message,
    isValid: isEmpty(message)
  };
}