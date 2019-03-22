const route = require('express').Router();




// @route    GET api/authV2
// @desc     get all user testing
// @Access   Public
route.get('/', (req, res) => {
  try {
    res.send('testing')


  } catch (error) {
    res.status(500).json({ message: error })
  }
});






module.exports = route;
