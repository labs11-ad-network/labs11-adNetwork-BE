const route = require("express").Router();
const bcrypt = require("bcryptjs");
const models = require("../../common/helpers");
const { genToken } = require("../../common/authentication");
const { authenticateV2 } = require('../../common/authentication')

const validateLogin = require("../../validation/loginValidation")
const validateRegister = require("../../validation/registerValidation")

//error Helper 
const errorHelper = require('../../error-helper/errorHelper')

// @route    GET api/auth
// @desc     get all users for testing
// @Access   Public
route.get("/", async (req, res) => {
  const users = await models.get("users");
  res.status(200).json(users);
});


// @route    GET api/test
// @desc     get all user testing
// @Access   Public

// route.get("/test", async (req, res) => {
//   try {

//     const users = await models.get("usersV2");
//     // console.log('req.decoded', req.decoded);
//     res.status(200).json(users);
//   } catch (error) {
//     return errorHelper(500, error, res)

//   }
// });
route.get("/test", async (req, res) => {
  const users = await models.get("usersV2");
  res.status(200).json(users);
});



// @route    GET api/test
// @desc     signing up user 
// @Access   Public
route.post('/test', async (req, res) => {
  const { name, email, image_url, nickname, acct_type, phone, sub } = req.body

  if (!name || !email || !image_url || !nickname || !sub) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  try {
    const [id] = await models.add('usersV2', req.body)
    console.log('id', id);
    if (id) {
      return res.status(400).json({ message: 'user already exists' })

    } else {

      const user = await models.findBy('usersV2', { email })
      req.decoded = user
      res.status(200).json(user)

    }

  } catch (error) {
    return errorHelper(500, error, res)
  }
});


// @route    GET /api/auth/register
// @desc     register user
// @Access   Public
route.post("/register", async (req, res) => {
  const { message, isValid } = validateRegister(req.body);
  if (!isValid) {
    return res.status(422).json(message);
  }
  const {
    first_name,
    last_name,
    email,
    password,
    phone,
    acct_type,
    image_url,
    oauth_token
  } = req.body;
  try {
    if (!password && !oauth_token)
      return res
        .status(500)
        .json({
          message:
            "you must sign up using a password or some other social network"
        });
    const hash = password ? bcrypt.hashSync(password, 14) : null;

    const user = await models.findBy("users", { email });

    if (user) return res.status(409).json({ message: "User already exists" });

    const [id] = await models.add("users", {
      first_name,
      last_name,
      email,
      password: oauth_token ? null : hash,
      phone,
      acct_type,
      image_url,
      oauth_token
    });

    const newUser = await models.findBy("users", { id });
    delete newUser.password;

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error });
  }
});

// @route    GET /api/auth/login
// @desc     login user
// @Access   Public
route.post("/login", async (req, res) => {
  const { message, isValid } = validateLogin(req.body);
  if (!isValid) {
    return res.status(422).json(message);
  }
  const { email, password, oauth_token } = req.body;

  try {
    const user = await models.findBy("users", { email });

    if (oauth_token) {


      const oauth_user = await models.findBy("users", { oauth_token, email });
      const token = await genToken(oauth_user);
      if (oauth_user) return res.json({ user: oauth_user, token });

    }

    if (!user) return res.status(404).json({ message: "User does not exist" });

    const correct = bcrypt.compareSync(password, user.password);

    if (!correct)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = await genToken(user);

    if (!token) return res.status(500).json({ message: "Server error" });

    delete user.password;

    res.json({ user, token });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = route;





