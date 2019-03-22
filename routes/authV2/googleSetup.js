const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const db = require('../../data/dbConfig')


passport.serializeUser(function (user, done) {
  done(null, user);
})

passport.deserializeUser(function (obj, done) {
  done(null, obj);
})

passport.use(
  new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://localhost:3000/"
  }, async function (accessToken, refreshToken, profile, done) {
    console.log(profile)
    const user = await db.select().from('')
  })
)