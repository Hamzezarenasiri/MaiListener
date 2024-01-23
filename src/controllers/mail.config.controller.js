const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { mailConfigService, mailService } = require('../services');

const createMailConfig = catchAsync(async (req, res) => {
  req.body.user_id = req.user.id;
  const mailConfig = await mailConfigService.createMailConfig(req.body);
  const mailInfo = {
    email: mailConfig.email,
    password: mailConfig.password,
    imap_host: mailConfig.imap_host,
    port: mailConfig.port,
    email_id: mailConfig.id,
    user_id: mailConfig.user_id,
  };
  mailService.receiveMail(mailInfo);
  res.status(httpStatus.CREATED).send(mailConfig);
});

const getMailConfigs = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['email', 'imap_host']);
  filter.user_id = req.user.id;
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await mailConfigService.queryMailConfigs(filter, options);
  res.send(result);
});

const getMailConfig = catchAsync(async (req, res) => {
  const mailConfig = await mailConfigService.getMailConfigById(req.params.mailConfigId);
  if (!mailConfig) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Mail not found');
  }
  res.send(mailConfig);
});

const updateMailConfig = catchAsync(async (req, res) => {
  const mailConfig = await mailConfigService.updateMailConfigById(req.params.mailConfigId, req.body);
  res.send(mailConfig);
});

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
