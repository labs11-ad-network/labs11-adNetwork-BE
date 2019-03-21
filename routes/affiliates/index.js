const route = require("express").Router()
const models = require("../../common/helpers")

route.get('/', async (req, res) => {
  try {
    const affiliates = await models.findAllBy('users', { acct_type: 'affiliate' })
    if(affiliates) {
      res.status(200).json(affiliates)
    } else {
      res.status(500).json({ message: 'There are no affiliates in the DB.' })
    }
  } catch({ message }) {
    res.status(404).json({ message })
  }
})

route.get('/:id', async (req, res) => {
  const id  = req.params.id
  try {
    const affiliate = await models.findBy('users', { acct_type: 'affiliate', id })
    if(affiliate) {
      res.status(200).json(affiliate)
    } else {
      res.status(500).json({ message: 'Affiliate does not exist.' })
    }
  } catch({ message }) {
    res.status(404).json({ message })
  }
})

route.put('/:id', async (req, res) => {
  const id = req.params.id
  try {
    const success = await models.update('users', id, { ...req.body })
    if(success) {
      const affiliate = await models.findBy('users', { acct_type: 'affiliate', id })
      res.status(200).json({ affiliate, message: 'Affiliate edited successfully.' })
    } else {
      res.status(404).json({ message: 'There was an issue editing this affiliate.' })
    }
  } catch({ message }) {
    res.status(500).json({ message })
  }
})

route.delete('/:id', async (req, res) => {
  const id = req.params.id
  try {
    const success = await models.remove('users', id)
    if(success) {
      res.status(200).json({ message: 'Affiliate deleted successfully.' })
    } else {
      res.status(500).json({ message: 'There was an issue deleting this affiliate.' })
    }
  } catch({ message }) {
    res.status(404).json({ message })
  }
})

module.exports = route;
