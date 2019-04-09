const server = require("express").Router();
const nodemailer = require("nodemailer");

const validateContactForm = require("./contactFormValidation");

//nodemailer connect server
const transport = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "ladnetwork11@gmail.com",
    pass: "lambdaschool"
  }
};
const transporter = nodemailer.createTransport(transport);
transporter.verify((err, success) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Server is ready to take messages");
  }
});

// @route    /api/contactform
// @desc     POST Send an email for contact form on landing page
// @Access   Public
server.post("/", async (req, res) => {
  const { firstName, lastName, email, comments } = req.body;

  const { errors, isValid } = validateContactForm(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const mail = {
    from: email,
    to: "ladnetwork11@gmail.com",
    subject: `New Message from Lad Network Contact Form`,
    text: `
          From LAD network User:
          Full Name : ${firstName} ${lastName} 
          Email     : ${email} 
          Comments  : ${comments}`
  };

  transporter.sendMail(mail, (err, data) => {
    if (err) {
      res.json({ message: "fail", err });
    } else {
      res.json({ message: "success" });
    }
  });
});

module.exports = server;
