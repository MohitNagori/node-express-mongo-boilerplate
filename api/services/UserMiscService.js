'use strict';
const _ = require('lodash');
const STATUS_CODE = require('http-status-codes');
const {RuntimeError, ResourceNotfound, Unauthorized} = require('../../handlers/Errors');
const {DbOperationHelper, dbSchemas} = require('../../database');
const {UserSchema} = dbSchemas;

/**
 * @class UserMiscService
 * @description - User miscellaneous functionality service
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
class UserMiscService {

  /**
   * @constructor
   *
   * @param {Object} logger - The logger object
   *
   * @member {Object} this.logger - The logger object
   * @member {DbOperationHelper} this.dbOperationHelper - The DbOperationHelper instance
   */
  constructor(logger) {
    this.logger = logger;
    this.dbOperationHelper = new DbOperationHelper(this.logger);
  }

  /**
   * @method changePassword
   * @description - Provide change password functionality into the system for user.
   *
   * @param {Object} swaggerParams - Incoming request swagger params
   * @param {ResponseObject} res - The response object for incoming request
   * @param (function) next - pass request to next middleware or handler
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   *
   * @returns {void}
   */
  changePassword(swaggerParams, res, next) {
    let payload = swaggerParams.change_password.value;
    let userId = swaggerParams.user_id.value;
    this.logger.info(`Change password request received by service for user [${userId}]`);

    const findByIdOptions = {
      query: userId,
      queryOptions: {},
      isLean: false
    };
    this.dbOperationHelper.findById(UserSchema, findByIdOptions, (error, user) => {
      if (error) {
        return next(
          RuntimeError(`An error occurred while retrieving user record for user [${userId}]`)
        );
      }
      if (_.isEmpty(user)) {
        this.logger.verbose(`User not found for user id [${userId}]`);
        return next(
          ResourceNotfound(`User not found for user id [${userId}]`)
        );
      }
      if (!user.validatePassword(payload.current_password)) {
        this.logger.warn(`User enter invalid current password while changing a password for user id [${userId}]`);
        return next(
          Unauthorized('Credentials does not match. Please try again')
        );
      }
      user.setPassword(payload.new_password);
      return this.dbOperationHelper.save(user, true, (error, updatedUser) => {
        if (error) {
          return next(
            RuntimeError(`An error occurred while updating user's password for user id [${userId}]`)
          );
        }
        this.logger.info(`Change password request successfully completed for user [${userId}]`);
        return res.status(STATUS_CODE.OK).json(updatedUser.getUserDetail());
      });
    });
  }
}

module.exports = UserMiscService;