const httpStatus = require('http-status');
const EventEmitter = require('events');
const catchAsync = require('../utils/catchAsync');
const { mailService, mailConfigService } = require('../services');
const ApiError = require('../utils/ApiError');
const { MailConfig } = require('../models');
const pick = require('../utils/pick');

const eventEmitter = new EventEmitter();
const getAndValidateMailConfig = async (mailConfigId) => {
  const mailConfig = await mailConfigService.getMailConfigById(mailConfigId);
  if (!mailConfig) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Mail not found');
  }
  return mailConfig;
};

const sendMail = catchAsync(async (req, res) => {
  const mailConfig = await getAndValidateMailConfig(req.params.mailConfigId);
  const mail = await mailService.sendMail({
    ...req.body,
    email: mailConfig.email,
    password: mailConfig.password,
  });
  res.status(httpStatus.OK).send(mail);
});

const receiveMail = catchAsync(async (req, res) => {
  const mailConfig = await getAndValidateMailConfig(req.params.mailConfigId);
  const mailInfo = {
    email: mailConfig.email,
    password: mailConfig.password,
    email_id: mailConfig.id,
    user_id: mailConfig.user_id,
    imap_host: mailConfig.imap_host,
    port: mailConfig.port,
  };
  const mail = await mailService.receiveMail(mailInfo);
  res.status(httpStatus.OK).send(mail);
});

const getEmails = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['email']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await mailService.queryEmails(filter, options);
  res.send(result);
});
eventEmitter.on('ReceiveEmails', async () => {
  const mailConfigs = await MailConfig.find();
  Array.from(mailConfigs).forEach((mailConfig) => {
    // for (const mailConfig of mailConfigs) {
    const mailInfo = {
      email: mailConfig.email,
      password: mailConfig.password,
      email_id: mailConfig.id,
      user_id: mailConfig.user_id,
      imap_host: mailConfig.imap_host,
      port: mailConfig.port,
    };
    mailService.receiveMail(mailInfo);
  });
});

module.exports = {
  sendMail,
  receiveMail,
  getEmails,
};
