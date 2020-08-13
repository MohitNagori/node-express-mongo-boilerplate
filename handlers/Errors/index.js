'use strict';
const ErrorHandler = require('./ErrorHandler');
const RuntimeError = require('./RuntimeError');
const ResourceNotfound = require('./ResourceNotfound');
const ValidationError = require('./ValidationError');
const Unauthorized = require('./Unauthorized');
const Forbidden = require('./Forbidden');
const PreConditionFailed = require('./PreConditionFailed');

/**
 * @module Error-handler-module
 * @description - Expose the error handler and different error support over the system
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
module.exports = {
  ErrorHandler,
  Forbidden,
  RuntimeError,
  PreConditionFailed,
  ResourceNotfound,
  ValidationError,
  Unauthorized
};
