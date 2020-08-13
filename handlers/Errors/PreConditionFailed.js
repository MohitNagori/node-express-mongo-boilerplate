'use strict';
const STATUS_CODE = require('http-status-codes');

/**
 * @module Pre-Condition-Failed
 * @description - Provide a functionality to handle pre condition failed error. And return with appropriate format.
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 *
 * @return {Object} - The precondition failed error object
 */
module.exports = (message, errors, code = 'PRECONDITION_FAILED') => {
  return {
    code: code,
    message: message,
    errors: errors,
    statusCode: STATUS_CODE.PRECONDITION_FAILED
  };
};