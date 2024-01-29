const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');

/**
 * Verify callback function for passport authentication.
 * @function
 * @param {Object} req - The request object.
 * @param {Function} resolve - The resolve function of the promise.
 * @param {Function} reject - The reject function of the promise.
 * @param {string[]} requiredRights - The required rights for authorization.
 * @returns {Function} The verify callback function.
 */
const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  req.user = user;

  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.userId !== user.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }

  resolve();
};

/**
 * Middleware function for authentication and authorization.
 * @module middleware/auth
 * @param {...string} requiredRights - The required rights for authorization.
 * @returns {Function} The middleware function.
 */
const auth = (...requiredRights) => async (req, res, next) => {
  try {
    await new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    });
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = auth;
