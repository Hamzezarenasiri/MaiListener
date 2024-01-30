/**
 * Passport configuration for Google OAuth2 authentication strategy.
 * @module passportConfig
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('../config/config');
const { mailConfigService, mailService } = require('../services');

/**
 * Passport configuration for Google OAuth2 authentication strategy.
 * @function
 * @param {Object} request - The request object.
 * @param {string} accessToken - The access token.
 * @param {string} refreshToken - The refresh token.
 * @param {Object} info - Additional information.
 * @param {Object} profile - The user profile.
 * @param {Function} done - The done callback function.
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL,
      passReqToCallback: true,
    },
    async (request, accessToken, refreshToken, info, profile, done) => {
      const mailConfig = await mailConfigService.createOrGetMailConfig({
        accessToken,
        refreshToken,
        user_id: request.query.state,
        email: profile.emails[0].value,
        imap_host: 'imap.gmail.com',
      });
      const mailInfo = {
        accessToken: mailConfig.accessToken,
        refreshToken: mailConfig.refreshToken,
        email: mailConfig.email,
        password: mailConfig.password,
        imap_host: mailConfig.imap_host,
        port: mailConfig.port,
        email_id: mailConfig.id,
        user_id: mailConfig.user_id,
      };
      await mailService.receiveGmail(mailInfo);
      done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Middleware used in protected routes to check if the user has been authenticated
const isLoggedIn = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
};

module.exports = {
  isLoggedIn,
};
