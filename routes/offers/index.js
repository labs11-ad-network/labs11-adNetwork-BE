const route = require("express").Router()
const models = require("../../common/helpers")

route.get("/", async (req, res) => {
  try {
    const offers = await models.get('offers')
    if(offers) {
      res.status(200).json(offers)
    } else {
      res.status(404).json({ message: 'There was an issue retrieving the offers.' })
    }
  } catch ({ message }) {
    res.status(500).json({ message })
  }
});

route.get('/:id', async (req, res) => {
  const id = req.params.id
  try {
    const offer = await models.findBy('offers', { id });
    if(offer) {
      res.status(200).json(offer)
    } else {
      res.status(404).json({ message: 'There was no offer found at that ID.' })
    }
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

route.post('/', async (req, res) => {
  // Make sure to stop any attempts to create any info with IDs or timestamps
  if( !(req.body.hasOwnProperty('budget') &&
        req.body.hasOwnProperty('name') &&
        req.body.hasOwnProperty('description') &&
        req.body.hasOwnProperty('category') &&
        req.body.hasOwnProperty('currency') &&
        req.body.hasOwnProperty('status')) ) {
          res.status(400).json({ message: 'Required information is missing.'})
    }

  try {
    const [ id ] = await models.add('offers', { ...req.body })
    if(id) {
      const offer = await models.findBy('offers', { id })
      res.status(201).json(offer)
    } else {
      res.status(404).json({ message: 'There was an issue adding user at that ID.' })
    }
  } catch({ message }) {
    res.status(500).json({ message })
  }
})

route.put('/:id', async (req, res) => {
  const id = req.params.id
  try {
    const success = await models.update('offers', id, { ...req.body })
    if(success) {
      const offer = await models.findBy('offers', { id })
      res.status(200).json({ offer, message: 'Offer successfully edited.' })
    } else {
      res.status(404).json({ message: 'There was an issue editing the offer at that ID.' })
    }
  } catch({ message }) {
    res.status(500).json({ message })
  }
})


route.delete('/:id', async (req, res) => {
  const id = req.params.id
  try {
    const success = await models.remove('offers', id)
    if(success) {
      res.status(200).json({ message: 'User successfully deleted.' })
    } else {
      res.status(404).json({ message: 'There was an issue deleting the user at that ID.' })
    }
  } catch ({ message }) {
    res.status(500).json({ message })
  }
})

module.exports = route;
