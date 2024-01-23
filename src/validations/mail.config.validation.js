const Joi = require('joi');
const { urlValidator, objectId } = require('./custom.validation');

const createMailConfig = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    imap_host: Joi.string().optional().custom(urlValidator),
    port: Joi.number().optional(),
    tls: Joi.bool().optional(),
  }),
};

const getMailConfigs = {
  query: Joi.object().keys({
    imap_host: Joi.string(),
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

module.exports = { createMailConfig, deleteMailConfig, getMailConfigs };
