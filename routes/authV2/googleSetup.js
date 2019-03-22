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
    callbackURL: "https://localhost:3000/api/usersV2/google/callback"
  }, async function (accessToken, refreshToken, profile, done) {
    const user = await db.select().from('usersV2').where({ googleId: profile.id }).first();
    if (user) {
      return done(null, profile);
    } else {
      await db.insert({ googleId: profileId }).into('usersV2').returning('id');
      return done(null, profile)

    }
  })
)
module.exports = { passport: passport };
