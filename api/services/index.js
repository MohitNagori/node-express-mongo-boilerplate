'use strict';
const AuthenticationService = require('./AuthenticationService');
const StatusService = require('./StatusService');
const UserMiscService = require('./UserMiscService');
const UserService = require('./UserService');

/**
* @module Services
* @description - Expose the services of controller business logic over the system
*
* @author Mohit Nagori <nagorimohit21@gmail.com>
* @since 20-July-2019
*
* @return {Object} config - The services object
*/
module.exports = {
  AuthenticationService,
  StatusService,
  UserMiscService,
  UserService
};
