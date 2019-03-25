const route = require("express").Router();
const models = require("../../common/helpers");
const { authenticate } = require('../../common/authentication')
const db = require('../../data/dbConfig')


route.get("/", authenticate, async (req, res) => {
  const { id, sub, email } = req.decoded;
  console.log('---- req.decoded ----', req.decoded);

  try {
    const users = await db.select().from('usersV2').where({ email }).andWhere({ sub }).first()

    if (users) {
      res.status(200).json(users);
    } else {
      res.status(500).json({ message: "Users do not exist." });
    }
  } catch ({ message }) {
    res.status(404).json({ message });
  }
});

route.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await models.findBy("usersV2", { id });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(500).json({ message: "User does not exist." });
    }
  } catch ({ message }) {
    res.status(404).json({ message });
  }
});

route.put("/:id", async (req, res) => {
  const { email, sub } = req.body;
  if (email || sub) {
    return res.status(500).json({ message: 'updating email and sub is not allowed' })
  }
  const id = req.params.id;
  try {
    const success = await models.update("usersV2", id, { ...req.body });
    if (success) {
      const user = await models.findBy("usersV2", { id });
      res.status(200).json({ user, message: "User edited successfully." });
    } else {
      res
        .status(404)
        .json({ message: "There was an issue editing this user." });
    }
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

route.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const success = await models.remove("usersV2", id);
    if (success) {
      res.status(200).json({ message: "User deleted successfully." });
    } else {
      res
        .status(500)
        .json({ message: "There was an issue deleting this user." });
    }
  } catch ({ message }) {
    res.status(404).json({ message });
  }
});

module.exports = route;
