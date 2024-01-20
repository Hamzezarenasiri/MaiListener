const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { mailService } = require('../services');

const createMailConfig = catchAsync(async (req, res) => {
  req.body.user_id = req.user.id;
  const mailConfig = await mailService.createMail(req.body);
  res.status(httpStatus.CREATED).send(mailConfig);
});

const getMailConfigs = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['email', 'domain']);
  filter.user_id = req.user.id;
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await mailService.queryMails(filter, options);
  res.send(result);
});

const getMail = catchAsync(async (req, res) => {
  const user = await mailService.getMailById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Mail not found');
  }
  res.send(user);
});

const updateMail = catchAsync(async (req, res) => {
  const user = await mailService.updateMailById(req.params.userId, req.body);
  res.send(user);
});

const deleteMail = catchAsync(async (req, res) => {
  await mailService.deleteMailById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createMailConfig,
  getMailConfigs,
  getMail,
  updateMail,
  deleteMail,
};
