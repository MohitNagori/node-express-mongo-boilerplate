'use strict';
const STATUS_CODE = require('http-status-codes');

/**
 * @module Forbidden
 * @description - Provide a functionality to handle forbidden error. And return with appropriate format.
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 *
 * @return {Object} - The forbidden error object
 */
module.exports = (message) => {
  return {
    code: 'FORBIDDEN',
    message: message,
    statusCode: STATUS_CODE.FORBIDDEN
  };
};
