'use strict';
const AuthenticationController = require('./AuthenticationController');
const StatusController = require('./StatusController');
const UserController = require('./UserController');
const UserMiscController = require('./UserMiscController');

/**
 * @module Controllers
 * @description - Expose the Controllers over the system
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
module.exports = {
  AuthenticationController,
  StatusController,
  UserMiscController,
  UserController
};
