const Joi = require('joi');

const sendMail = {
  body: Joi.object().keys({
    to: Joi.string().required().email(),
    subject: Joi.string().required(),
    text: Joi.string().optional(),
  }),
};

const getEmails = {
  query: Joi.object().keys({
    email: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = { sendMail, getEmails };
