/**
 * A module for managing mail configurations and operations.
 * @module mailController
 */

const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { mailConfigService, mailService } = require('../services');

/**
 * Creates a new mail configuration.
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} A promise that resolves when the mail configuration is created.
 * @throws {ApiError} If the mail configuration is not found.
 */
const createMailConfig = catchAsync(async (req, res) => {
  const mailConfig = await mailConfigService.createMailConfig({ ...req.body, user_id: req.user.id });
  mailService.receiveMail({ ...mailConfig, email_id: mailConfig.id });
  res.status(httpStatus.CREATED).send(mailConfig);
});

/**
 * Retrieves mail configurations.
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} A promise that resolves with the mail configurations.
 */
const getMailConfigs = catchAsync(async (req, res) => {
  const filter = { ...pick(req.query, ['email', 'imap_host']), user_id: req.user.id };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await mailConfigService.queryMailConfigs(filter, options);
  res.send(result);
});

/**
 * Retrieves a mail configuration by ID.
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} A promise that resolves with the mail configuration.
 * @throws {ApiError} If the mail configuration is not found.
 */
const getMailConfig = catchAsync(async (req, res) => {
  const mailConfig = await mailConfigService.getMailConfigById(req.params.mailConfigId);
  if (!mailConfig) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Mail not found');
  }
  res.send(mailConfig);
});

/**
 * Updates a mail configuration by ID.
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} A promise that resolves with the updated mail configuration.
 */
const updateMailConfig = catchAsync(async (req, res) => {
  const mailConfig = await mailConfigService.updateMailConfigById(req.params.mailConfigId, req.body);
  res.send(mailConfig);
});

/**
 * Deletes a mail configuration by ID.
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} A promise that resolves when the mail configuration is deleted.
 */
const deleteMailConfig = catchAsync(async (req, res) => {
  await mailConfigService.deleteMailConfigById(req.params.mailConfigId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createMailConfig,
  getMailConfigs,
  getMailConfig,
  updateMailConfig,
  deleteMailConfig,
};
