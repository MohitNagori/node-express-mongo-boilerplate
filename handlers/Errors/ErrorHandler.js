'use strict';

/**
 * @module ErrorHandler
 * @description - Provide a functionality to handle error. And return with appropriate format.
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
module.exports = (errorObj, req, res) => {
  let statusCode = errorObj.statusCode || res.statusCode;
  let errorMessage = errorObj.message;
  let errorCode = errorObj.code;
  let errors = (errorObj.results && errorObj.results.errors) || errorObj.errors;

  return res.status(statusCode).json({
    code: errorCode,
    message: errorMessage,
    errors: errors
  });
};
