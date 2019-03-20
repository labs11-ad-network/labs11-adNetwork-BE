const route = require("express").Router();
const models = require("../../common/helpers");

route.get("/", async (req, res) => {
  try {
    const offers = await models.get("offers");
    res.json(offers);
  } catch (error) {
    res.status(500).json(error);
  }
});

route.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await models.findBy("offers", { id });

    if (!offer) return res.status(404).json({ message: "Offer not found" });

    res.json(offer);
  } catch (error) {
    res.status(500).json(error);
  }
});

// route.post('/', async (req, res) => {
//   const {
//     budget,
//     name,
//     description,
//     category,
//     currency,
//     status
//   }
//   try {

//   } catch (error) {

//   }
// })

module.exports = route;
