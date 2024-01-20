const Joi = require('joi');
const { objectId } = require('./custom.validation');

const sendMail = {
  body: Joi.object().keys({
    to: Joi.string().required().email(),
    subject: Joi.string().required(),
    text: Joi.string().optional(),
  }),
};

const getMailConfigs = {
  query: Joi.object().keys({
    domain: Joi.string(),
    email: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const deleteMailConfig = {
  params: Joi.object().keys({
    mailConfigId: Joi.string().custom(objectId),
  }),
};

module.exports = { sendMail, deleteMailConfig, getMailConfigs };
