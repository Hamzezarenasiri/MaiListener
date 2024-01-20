const httpStatus = require('http-status');
const { MailConfig } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a mailConfig
 * @param {Object} mailConfigBody
 * @returns {Promise<MailConfig>}
 */
const createMailConfig = async (mailConfigBody) => {
  if (await MailConfig.isEmailTaken(mailConfigBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already exist');
  }
  return MailConfig.create(mailConfigBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<void>}
 */
const queryMailConfigs = async (filter, options) => {
  return MailConfig.paginate(filter, options);
};

/**
 * Get mail by id
 * @param {ObjectId} id
 * @returns {Promise<MailConfig>}
 */
const getMailConfigById = async (id) => {
  return MailConfig.findById(id);
};

/**
 * Get mail by email
 * @param {string} email
 * @returns {Promise<MailConfig>}
 */
const getMailConfigByEmail = async (email) => {
  return MailConfig.findOne({ email });
};

/**
 * Update mail by id
 * @param {ObjectId} mailId
 * @param {Object} updateBody
 * @returns {Promise<MailConfig>}
 */
const updateMailConfigById = async (mailId, updateBody) => {
  const mail = await getMailConfigById(mailId);
  if (!mail) {
    throw new ApiError(httpStatus.NOT_FOUND, 'MailConfig not found');
  }
  if (updateBody.email && (await MailConfig.isEmailTaken(updateBody.email, mailId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already exist');
  }
  Object.assign(mail, updateBody);
  await mail.save();
  return mail;
};

/**
 * Delete mail by id
 * @param {ObjectId} mailId
 * @returns {Promise<MailConfig>}
 */
const deleteMailConfigById = async (mailId) => {
  const mail = await getMailConfigById(mailId);
  if (!mail) {
    throw new ApiError(httpStatus.NOT_FOUND, 'MailConfig not found');
  }
  await mail.remove();
  return mail;
};

module.exports = {
  createMailConfig,
  queryMailConfigs,
  getMailConfigById,
  getMailConfigByEmail,
  updateMailConfigById,
  deleteMailConfigById,
};
