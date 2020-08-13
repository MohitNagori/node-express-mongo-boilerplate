'use strict';
const STATUS_CODE = require('http-status-codes');

/**
 * @module Resource-Not-Found
 * @description - Provide a functionality to handle resource not found error.
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 *
 * @return {Object} - The resource not found error object
 */
module.exports = (message) => {
  return {
    code: 'NOT_FOUND',
    message: message,
    statusCode: STATUS_CODE.NOT_FOUND
  };
};