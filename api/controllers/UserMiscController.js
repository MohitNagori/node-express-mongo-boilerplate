'use strict';
const {UserMiscService} = require('../services');

/**
 * @module User Miscellaneous Controller
 * @description - Expose the UserMisc Controller functions
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
module.exports = {
  /**
   * @method changePassword
   * @description - Provide change password functionality from the system for user.
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
  changePassword: (req, res, next) => {
    let userMiscService = new UserMiscService(req.logger);
    userMiscService.changePassword(req.swagger.params, res, next);
  }
};