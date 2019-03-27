const route = require("express").Router()
const models = require("../../common/helpers")
const { authenticate } = require("../../common/authentication");




// @route    /api/advertisers
// @desc     GET advertiser
// @Access   Public
route.get('/', async (req, res) => {
  try {
    const advertisers = await models.findAllBy('users', { acct_type: 'advertiser' })
    if (advertisers) {
      res.status(200).json(advertisers)
    } else {
      res.status(500).json({ message: 'There are no advertisers in the DB.' })
    }
  } catch ({ message }) {
    res.status(500).json({ message })
  }
})

// @route    /api/advertisers
// @desc     GET advertiser by id
// @Access   private
route.get('/:id', authenticate, async (req, res) => {
  const id = req.decoded.id
  try {
    const advertiser = await models.findBy('users', { acct_type: 'advertiser', id })
    if (advertiser) {
      const offers = await models.findAllBy('offers', { advertiser_id: id })
      advertiser.offers = offers
      res.status(200).json(advertiser)
    } else {
      res.status(500).json({ message: 'Advertiser does not exist.' })
    }
  } catch ({ message }) {
    res.status(500).json({ message })
  }
})

// @route    /api/advertisers/:id
// @desc     PUT advertiser by id
// @Access   Public
route.put('/:id', async (req, res) => {
  const id = req.params.id
  try {
    const success = await models.update('users', id, { ...req.body })
    if (success) {
      const advertiser = await models.findBy('users', { acct_type: 'advertiser', id })
      res.status(200).json({ advertiser, message: 'Advertiser edited successfully.' })
    } else {
      res.status(404).json({ message: 'There was an issue editing this advertiser.' })
    }
  } catch ({ message }) {
    res.status(500).json({ message })
  }
})

// @route    /api/advertisers/:id
// @desc     DELETE advertiser by id
// @Access   Public
route.delete('/:id', async (req, res) => {
  const id = req.params.id
  try {
    const success = await models.remove('users', id)
    if (success) {
      res.status(200).json({ message: 'Advertiser deleted successfully.' })
    } else {
      res.status(500).json({ message: 'There was an issue deleting this advertiser.' })
    }
  } catch ({ message }) {
    res.status(500).json({ message })
  }
})

module.exports = route;
