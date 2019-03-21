const route = require("express").Router();
const models = require("../../common/helpers");

route.get("/", async (req, res) => {
  try {
    const agreements = await models.get("agreements");
    if (agreements) {
      res.status(200).json(agreements);
    } else {
      res
        .status(404)
        .json({ message: "There was an issue retrieving the offers." });
    }
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

route.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const agreement = await models.findBy("agreements", { id });
    if (agreement) {
      res.status(200).json(agreement);
    } else {
      res
        .status(404)
        .json({ message: "There was no agreement found at that ID." });
    }
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

// Without authentication. When we add that we will refactor based on
// whether req.decoded.id is affiliate_id or advertiser_id
route.post("/", async (req, res) => {
  if (
    !(
      req.body.hasOwnProperty("offer_id") &&
      req.body.hasOwnProperty("affiliate_id")
    )
  ) {
    res.status(400).json({ message: "Required information is missing." });
  }
  try {
    const [id] = await models.add("agreements", req.body);
    if (id) {
      const agreement = await models.findBy("agreements", { id });
      res.status(201).json(agreement);
    } else {
      res
        .status(404)
        .json({ message: "There was an issue adding agreement at that ID." });
    }
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

module.exports = route;
