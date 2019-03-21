
const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateRegister(data) {
  let message = {};
  // ------------ value cannot be null or undefine -----------------
  data.email = !isEmpty(data.email) ? data.email : "";
  data.last_name = !isEmpty(data.last_name) ? data.last_name : "";
  data.first_name = !isEmpty(data.first_name) ? data.first_name : "";
  data.last_name = !isEmpty(data.last_name) ? data.last_name : "";
  data.phone = !isEmpty(data.phone) ? data.phone : "";
  //data.acct_type = !isEmpty(data.acct_type) ? data.acct_type : "";




  // ----------------- has to be a valid email ----------------------
  if (!Validator.isEmail(data.email)) {
    message.email = "has to be a valid email";
  }

  // ----------------- fields are required ----------------------
  if (Validator.isEmpty(data.email)) {
    message.email = "Email field is required";
  }
  if (Validator.isEmpty(data.first_name)) {
    message.first_name = "first_name field is required";
  }
  if (Validator.isEmpty(data.last_name)) {
    message.last_name = "last_name field is required";
  }
  if (Validator.isEmpty(data.phone)) {
    message.phone = "phone field is required";
  }
  // if (Validator.isEmpty(data.acct_type)) {
  //   errors.acct_type = "acct_type field is required";
  // }


  return {
    message,
    isValid: isEmpty(message)
  };
}

