/**
 * Contains authentication controller functions.
 * @module controllers/authController
 */

const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const logger = require('../config/logger');

/**
 * Sends a response with HTTP status code 204 (No Content).
 * @param {Object} res - The response object.
 */
const sendNoContent = (res) => res.status(httpStatus.NO_CONTENT).send();

/**
 * Registers a new user.
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {Object} req.body - The user data.
 * @returns {Object} The registered user and authentication tokens.
 */
const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

/**
 * Logs in a user.
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.email - The user's email.
 * @param {string} req.body.password - The user's password.
 * @returns {Object} The logged in user and authentication tokens.
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

/**
 * Logs out a user.
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.refreshToken - The user's refresh token.
 */
const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  sendNoContent(res);
});

/**
 * Refreshes authentication tokens.
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.refreshToken - The user's refresh token.
 * @returns {Object} The new authentication tokens.
 */
const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send(tokens);
});

/**
 * Sends a reset password email to the user.
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.email - The user's email.
 */
const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  sendNoContent(res);
});

/**
 * Resets the user's password.
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} req.query - The request query parameters.
 * @param {string} req.query.token - The reset password token.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.password - The new password.
 */
const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  sendNoContent(res);
});

/**
 * Sends a verification email to the user.
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} req.user - The authenticated user.
 */
const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  try {
    emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  } catch (error) {
    logger.error(error);
  }
  sendNoContent(res);
});

/**
 * Verifies the user's email.
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} req.query - The request query parameters.
 * @param {string} req.query.token - The verification token.
 */
const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  sendNoContent(res);
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
