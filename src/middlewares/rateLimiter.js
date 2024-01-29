/**
 * Contains the rate limiter middleware for authentication requests.
 * @module middleware/rateLimiter
 */

const rateLimit = require('express-rate-limit');

/**
 * The rate limiter middleware for authentication requests.
 * @type {Function}
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
});

module.exports = {
  authLimiter,
};
