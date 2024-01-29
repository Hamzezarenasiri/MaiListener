/**
 * Contains utility functions for extracting data from strings.
 * @module utils/stringUtils
 */

/**
 * Extracts name and email from a string.
 * @function
 * @param {string} inputString - The input string.
 * @returns {Object} An object containing the extracted name and email.
 * @property {string|null} name - The extracted name, or null if not found.
 * @property {string|null} email - The extracted email, or null if not found.
 */
const extractDataFromString = function (inputString) {
  const emailRegex = /([^<]*)<([^>]+)>/;
  const match = inputString.match(emailRegex);

  return {
    name: (match && match[1] && match[1].trim()) || null,
    email: match && match[2] !== undefined ? match[2] : null,
  };
};

/**
 * Extracts name and email from a string.
 * @function
 * @param {string} inputString - The input string.
 * @returns {Object} An object containing the extracted name and email.
 * @property {string|null} name - The extracted name, or null if not found.
 * @property {string|null} email - The extracted email, or null if not found.
 */
const extractNameAndEmailFromString = function (inputString) {
  return extractDataFromString(inputString);
};

/**
 * Extracts email from a string.
 * @function
 * @param {string} inputString - The input string.
 * @returns {string|Object} The extracted email, or an empty object if not found or invalid format.
 */
const extractEmailFromString = function (inputString) {
  return extractDataFromString(inputString).email || {};
};

module.exports = {
  extractEmailFromString,
  extractNameAndEmailFromString,
};
