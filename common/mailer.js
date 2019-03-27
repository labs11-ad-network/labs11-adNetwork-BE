const mailer = require("nodemailer");

const emailer = (res, email) => {
  const smtpTransport = mailer.createTransport({
    service: "Gmail",
    auth: {
      user: "ladnetwork11@gmail.com",
      pass: "lambdaschool"
    }
  });

  const mail = {
    from: "LAD Network <ladnetwork@gmail.com>",
    to: email,
    subject: "Someone obtained your offer",
    text: `Hey, an affiliate just got your offer on their website. you can now track its analytics`
  };

  smtpTransport.sendMail(mail, function(error, response) {
    if (error) {
      console.log(error);
      res.status(500).json({ message: "Email did not send" });
    } else {
      console.log("Message sent!");
    }

    smtpTransport.close();
  });
};

module.exports = emailer;
