const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateLogin(data) {
  let errors = {};
  data.email = !isEmpty(data.email) ? data.email : "";


  // ----------------- has to be a valid email ----------------------
  if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }
  // ----------------- fields are required ----------------------
  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
}