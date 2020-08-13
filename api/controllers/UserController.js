'use strict';
const {UserService} = require('../services');

/**
 * @module User Controller
 * @description - Expose the User Controller functions
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
module.exports = {
  /**
   * @method createUser
   * @description - Provide create user functionality into the system.
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
  createUser: (req, res, next) => {
    let userService = new UserService(req.logger);
    userService.createUser(req.swagger.params, res, next);
  },

  /**
   * @method getUserList
   * @description - Provide get list of user functionality into the system.
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
  getUserList: (req, res, next) => {
    let userService = new UserService(req.logger);
    userService.getUserList(req, res, next);
  },

  /**
   * @method getUserById
   * @description - Provide get user by id functionality into the system.
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
  getUserById: (req, res, next) => {
    let userService = new UserService(req.logger);
    userService.getUserById(req.swagger.params, res, next);
  },

  /**
   * @method deleteUserById
   * @description - Provide delete user by id functionality into the system.
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
  deleteUserById: (req, res, next) => {
    let userService = new UserService(req.logger);
    userService.deleteUserById(req, res, next);
  },

  /**
   * @method updateUserById
   * @description - Provide update user by id functionality into the system.
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
  updateUserById: (req, res, next) => {
    let userService = new UserService(req.logger);
    userService.updateUserById(req.swagger.params, res, next);
  }
};