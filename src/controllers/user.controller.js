/**
 * A module for managing user-related operations.
 * @module userController
 */

const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');

/**
 * Creates a new user.
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} A promise that resolves when the user is created.
 */
const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

/**
 * Retrieves users based on the provided filter and options.
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} A promise that resolves with the users.
 */
const getUsers = catchAsync(async (req, res) => {
  const { query } = req;
  const filter = pick(query, ['name', 'role']);
  const options = pick(query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

/**
 * Retrieves a user by ID.
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} A promise that resolves with the user.
 * @throws {ApiError} If the user is not found.
 */
const getUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

/**
 * Updates a user by ID.
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} A promise that resolves with the updated user.
 */
const updateUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const user = await userService.updateUserById(userId, req.body);
  res.send(user);
});

/**
 * Deletes a user by ID.
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} A promise that resolves when the user is deleted.
 */
const deleteUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  await userService.deleteUserById(userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
