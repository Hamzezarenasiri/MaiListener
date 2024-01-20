const Joi = require('joi');
const { password, urlValidator } = require('./custom.validation');

const createMailConfig = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    domain: Joi.string().optional().custom(urlValidator),
    port: Joi.number().optional(),
    tls: Joi.bool().optional(),
  }),
};

module.exports = { createMailConfig };
