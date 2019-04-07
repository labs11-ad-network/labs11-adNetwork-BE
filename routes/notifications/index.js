const route = require("express").Router();
const models = require("../../common/helpers.js");
const db = require("../../data/dbConfig.js");
const { authenticate } = require("../../common/authentication");

route.get("/", authenticate, async (req, res) => {
  const user_id = req.decoded.id;
  try {
    const notifications = await models.findAllBy("notifications", {
      recipient: user_id,
      unread: true
    });
    res.status(200).json(notifications);
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

route.get("/:id", authenticate, async (req, res) => {
  const id = req.params.id;

  try {
    const notification = await models.findBy("notifications", { id });
    res.status(200).json(notification);
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

route.post("/", authenticate, async (req, res) => {
  const { recipient, type, entity_id, msg_body } = req.body;
  if (
    !(
      req.body.hasOwnProperty("recipient") &&
      req.body.hasOwnProperty("type") &&
      req.body.hasOwnProperty("msg_body") &&
      req.body.hasOwnProperty("entity_id")
    )
  ) {
    res.status(400).json({ message: "Required information is missing." });
  } else {
    try {
      const [id] = await models.add("notifications", {
        recipient,
        type,
        entity_id,
        msg_body
      });
      if (id) {
        const notification = await models.findBy("notifications", { id });
        res.status(201).json(notification);
      } else {
        res.status(404).json({
          message: "There was an issue adding notification at that ID."
        });
      }
    } catch ({ message }) {
      res.status(500).json({ message });
    }
  }
});

route.put("/:id", authenticate, async (req, res) => {
  const { unread } = req.body;
  const id = req.params.id;
  const user_id = req.decoded.id;
  if (!req.body.hasOwnProperty("unread")) {
    res.status(400).json({ message: "Required information is missing." });
  } else {
    try {
      const notificationCheck = await models.findBy("notifications", {
        id,
        recipient: user_id
      });

      if (!notificationCheck) {
        return res
          .status(401)
          .json({ message: "You cannot edit someone else's notification" });
      }

      const success = await models.update("notifications", id, {
        unread
      });

      if (success) {
        const notifications = await models
          .findAllBy("notifications", { recipient: user_id, unread: true })
          .orderBy("created_at", "dsc");

        res.status(201).json(notifications);
      } else {
        res.status(404).json({
          message: "There was an issue editing the notification at that ID."
        });
      }
    } catch ({ message }) {
      res.status(500).json({ message });
    }
  }
});

module.exports = route;
