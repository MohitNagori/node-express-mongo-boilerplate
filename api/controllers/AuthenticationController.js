'use strict';
const {AuthenticationService} = require('../services');

/**
 * @module Authentication Controller
 * @description - Expose the Authentication Controller functions
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
module.exports = {
  /**
   * @method login
   * @description - Provide login functionality into the system for user.
   *
   * @param {RequestObject} req - Incoming request object
   * @param {ResponseObject} res - The response object for incoming request
   * @param (function) next - pass request to next middleware or handler
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   *
   * @returns {void}
   */
  login: (req, res, next) => {
    let authenticationService = new AuthenticationService(req.logger);
    authenticationService.login(req.swagger.params, res, next);
  },

  /**
   * @method logout
   * @description - Provide logout functionality from the system for user.
   *
   * @param {RequestObject} req - Incoming request object
   * @param {ResponseObject} res - The response object for incoming request
   * @param (function) next - pass request to next middleware or handler
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   *
   * @returns {void}
   */
  logout: (req, res, next) => {
    let authenticationService = new AuthenticationService(req.logger);
    authenticationService.logout(req, res, next);
  }
};