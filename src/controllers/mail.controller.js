/**
 * A module for handling email-related operations.
 * @module emailController
 */

const httpStatus = require('http-status');
const EventEmitter = require('events');
const catchAsync = require('../utils/catchAsync');
const { mailService, mailConfigService } = require('../services');
const ApiError = require('../utils/ApiError');
const { MailConfig } = require('../models');
const pick = require('../utils/pick');
const logger = require('../config/logger');

const eventEmitter = new EventEmitter();
setTimeout(() => {
  eventEmitter.emit('ReceiveEmails');
  logger.info(' <<<<<<<<<<<Emitter>>>>>>>>>>>>');
}, 2000);

/**
 * Creates a mailInfo object based on the given mailConfig.
 * @param {Object} mailConfig - The mail configuration object.
 * @returns {Object} The mailInfo object.
 */
const createMailInfo = (mailConfig) => ({
  email: mailConfig.email,
  password: mailConfig.password,
  email_id: mailConfig.id,
  user_id: mailConfig.user_id,
  imap_host: mailConfig.imap_host,
  port: mailConfig.port,
  accessToken: mailConfig.accessToken,
  refreshToken: mailConfig.refreshToken,
});

/**
 * Retrieves and validates the mail configuration by ID.
 * @param {string} mailConfigId - The ID of the mail configuration.
 * @returns {Promise<Object>} The validated mail configuration.
 * @throws {ApiError} If the mail configuration is not found.
 */
const getAndValidateMailConfig = async (mailConfigId) => {
  const mailConfig = await mailConfigService.getMailConfigById(mailConfigId);
  if (!mailConfig) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Mail not found');
  }
  return mailConfig;
};

/**
 * Sends an email.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} A promise that resolves when the email is sent.
 */
const sendMail = catchAsync(async (req, res) => {
  const mailConfig = await getAndValidateMailConfig(req.params.mailConfigId);
  const mail = await mailService.sendMail({
    ...req.body,
    email: mailConfig.email,
    password: mailConfig.password,
  });
  res.status(httpStatus.OK).send(mail);
});

/**
 * Receives emails.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} A promise that resolves when the emails are received.
 */
const receiveMail = catchAsync(async (req, res) => {
  const mailConfig = await getAndValidateMailConfig(req.params.mailConfigId);
  const mail = await mailService.receiveMail(createMailInfo(mailConfig));
  res.status(httpStatus.OK).send(mail);
});

/**
 * Gets emails based on the provided filter and options.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} A promise that resolves with the emails.
 */
const getEmails = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['email']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await mailService.queryEmails(filter, options);
  res.send(result);
});

/**
 * Event listener for receiving emails.
 */
eventEmitter.on('ReceiveEmails', async () => {
  logger.info(' <<<<<<<<<<<Emitter On :)>>>>>>>>>>>>');
  const mailConfigs = await MailConfig.find();
  mailConfigs.forEach((mailConfig) => {
    mailService.receiveMail(createMailInfo(mailConfig));
  });
});

module.exports = {
  sendMail,
  receiveMail,
  getEmails,
};
