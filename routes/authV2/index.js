const server = require('express').Router();
const auth = require('./googleSetup')



// GET route for when you click on login - passport authenticates through google
server.get('/google',
  auth.passport.authenticate('google', { scope: ['openid email profile'] }));

// If successful auth - redirects to home page, if not - redirects to /login
server.get('/google/callback',
  auth.passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  function (request, response) {
    // Authenticated successfully
    response.redirect('/');
  });

// GET logout route - will sign person out of session
server.get('/logout', function (request, response) {
  request.logout();
  response.redirect('/');
});

// Route middleware to ensure user is authenticated.
function ensureAuthenticated(request, response, next) {
  if (request.isAuthenticated()) {
    return next();
  }
  response.redirect('/login');
}





module.exports = server;
