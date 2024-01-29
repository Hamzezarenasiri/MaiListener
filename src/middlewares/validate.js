const Joi = require('joi');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

/**
 * Middleware function for validating request data using Joi schemas.
 * @module middleware/validate
 * @param {Object} schema - The Joi schema to validate against.
 * @returns {Function} The middleware function.
 */
const validate = (schema) => async (req, res, next) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));

  try {
    const value = await Joi.compile(validSchema)
      .prefs({ errors: { label: 'key' }, abortEarly: false })
      .validateAsync(object);
    Object.assign(req, value);
    next();
  } catch (error) {
    next(new ApiError(httpStatus.BAD_REQUEST, error.message));
  }
};

module.exports = validate;
