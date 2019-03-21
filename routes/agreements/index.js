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

route.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const agreement = await models.findBy('agreements', { id });
    if (agreement) {
      res.status(200).json(agreement);
    } else {
      res.status(404).json({ message: 'There was no agreement found at that ID.'})
    }
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

module.exports = route;
