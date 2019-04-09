//name, email, message
const Validator = require("validator");

const isEmpty = value =>
  value === undefined ||
  value === null ||
  (typeof value === "object" && Object.keys(value).length === 0) ||
  (typeof value === "string" && value.trim().length === 0);

//check for empty undefiend , null ,object, string
module.exports = function validateContactForm(data) {
  let errors = {};

  //firstName, lastName, email, comments
  //if empty return "" for validator
  data.firstName = !isEmpty(data.firstName) ? data.firstName : "";
  data.lastName = !isEmpty(data.lastName) ? data.lastName : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.comments = !isEmpty(data.comments) ? data.comments : "";
  // if it's not valid return err
  // ordering matteres on which statement will return

  if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }
  // if it's not valid length
  if (!Validator.isLength(data.comments.trim(), { min: 2, max: 30 })) {
    errors.comments = "comments must be between 2 and 30 characters";
  }

  if (Validator.isEmpty(data.comments)) {
    errors.comments = "comments field is required";
  }
  if (Validator.isEmpty(data.firstName)) {
    errors.firstName = "firstName field is required";
  }
  if (Validator.isEmpty(data.lastName)) {
    errors.lastName = "lastName field is required";
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
