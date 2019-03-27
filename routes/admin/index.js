const route = require("express").Router()
const models = require("../../common/helpers")




// @route    /api/admin 
// @desc     Get admin
// @Access   Public
route.get('/', async (req, res) => {
  try {
    const admins = await models.findAllBy("users", { acct_type: "admin" })

    if (admins.length > 0) {
      res.status(200).json(admins)
    } else {
      res.status(404).json({ message: 'There was an issue retrieving the admin list.' })
    }
  } catch ({ message }) {
    res.status(500).json({ message })
  }
})


// @route     /api/admin/:id
// @desc     GET admin by id
// @Access   Public
route.get('/:id', async (req, res) => {
  const id = req.params.id

  try {
    const admin = await models.findBy('users', { acct_type: "admin", id })
    res.status(200).json(admin)
  } catch ({ message }) {
    res.status(500).json({ message })
  }
})

// @route    PUT /api/admin/:id
// @desc     update admin info
// @Access   Public
route.put('/:id', async (req, res) => {
  const id = req.params.id

  try {
    const success = await models.update('users', id, { ...req.body })
    if (success) {
      const user = await models.findBy('users', { acct_type: "admin", id })
      res.status(200).json({ user, message: 'Admin edited successfully.' })
    } else {
      res.status(404).json({ message: 'There was an issue editing this Admin.' })
    }
  } catch ({ message }) {
    res.status(500).json({ message })
  }
})

// @route     /api/admin/:id
// @desc     DELETE admin
// @Access   Public
route.delete('/:id', async (req, res) => {
  const id = req.params.id
  try {
    const success = await models.remove('users', id)
    if (success) {
      res.status(200).json({ message: 'Admin deleted successfully.' })
    } else {
      res.status(500).json({ message: 'There was an issue deleting this Admin.' })
    }
  } catch ({ message }) {
    res.status(404).json({ message })
  }
})

module.exports = route;
