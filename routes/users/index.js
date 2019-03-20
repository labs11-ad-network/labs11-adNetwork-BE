const route = require("express").Router();
const bcrypt = require("bcryptjs");
const models = require("../../common/helpers");
const { genToken } = require("../../common/authentication");

route.get("/", (req, res) => {
  res.json("USERS ROUTE");
});

route.post("/register", async (req, res) => {
  const { first_name, last_name, email, password, phone, acct_type } = req.body;

  try {
    console.log(req.body);
    if (
      !first_name ||
      !last_name ||
      !email ||
      !password ||
      !phone ||
      !acct_type
    )
      return res.status(422).json({ message: "All fields required" });

    const hash = bcrypt.hashSync(password, 14);

    const user = await models.findBy("users", { email });

    if (user) return res.status(409).json({ message: "User already exists" });

    const [id] = await models.add("users", {
      first_name,
      last_name,
      email,
      password: hash,
      phone,
      acct_type
    });

    const newUser = await models.findBy("users", { id });
    delete newUser.password;

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error });
  }
});

route.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password)
      return res.status(422).json({ message: "All fields required" });

    const user = await models.findBy("users", { email });

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
