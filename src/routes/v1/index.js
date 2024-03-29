const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const mailRoute = require('./mail.config.route');
const oauthMailRoute = require('./oauth.mail.config.route');
const receivedRoute = require('./received.mail.route');
const docsRoute = require('./docs.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/mail-configs',
    route: mailRoute,
  },
  {
    path: '/oauth-mail-configs',
    route: oauthMailRoute,
  },
  {
    path: '/received-emails',
    route: receivedRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
