const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { mailService, mailConfigService } = require('../services');
const ApiError = require('../utils/ApiError');

const sendMail = catchAsync(async (req, res) => {
  const mailConfig = await mailConfigService.getMailConfigById(req.params.mailConfigId);
  if (!mailConfig) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Mail not found');
  }
  req.body.email = mailConfig.email;
  req.body.password = mailConfig.password;
  const mail = await mailService.sendMail(req.body);
  res.status(httpStatus.OK).send(mail);
});
module.exports = {
  sendMail,
};
