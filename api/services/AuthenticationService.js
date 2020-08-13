'use strict';
const _ = require('lodash');
const STATUS_CODE = require('http-status-codes');
const {RuntimeError, ResourceNotfound, Unauthorized} = require('../../handlers/Errors');
const {DbOperationHelper, dbSchemas} = require('../../database');
const {jwtHelper} = require('../../helpers');
const {redisClient} = require('../../index');
const {UserSchema} = dbSchemas;

/**
 * @class AuthenticationService
 * @description - User authentication functionality service
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
class AuthenticationService {

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
   * @method login
   * @description - Provide login functionality into the system for user.
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
  login(swaggerParams, res, next) {
    let payload = swaggerParams.credentials.value;
    let password = payload.password;
    let email = payload.email;
    this.logger.info(`Login request received by service for email address [${email}]`);

    const query = {
      email: email
    };
    const findOneOptions = {
      query: query,
      queryOptions: {},
      isLean: false
    };
    this.dbOperationHelper.findOne(UserSchema, findOneOptions, (error, user) => {
      if (error) {
        return next(
          RuntimeError(`An error occurred while retrieving user detail for email address [${email}]`)
        );
      }
      if (_.isEmpty(user)) {
        this.logger.verbose(`User not found with email address [${email}]`);
        return next(
          ResourceNotfound(`User not found with email address [${email}]`)
        );
      }
      if (!user.validatePassword(password)) {
        this.logger.warn(`User try to login with incorrect password with email address [${email}]`);
        return next(
          Unauthorized('Invalid user credentials found')
        );
      }
      let userResponse = user.getUserDetail();
      return jwtHelper.sign(userResponse, this.logger, redisClient, (error, token) => {
        if (error) {
          return next(
            RuntimeError(`An error occurred during generating the jwt token for email address [${email}]`)
          );
        }
        this.logger.info(`Login request successfully completed for email address [${email}]`);
        res.setHeader('authorization', token);
        return res.status(STATUS_CODE.OK).json(userResponse);
      });
    });
  }

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
  logout(req, res, next) {
    this.logger.info(`Logout request received by service for user id [${req.user_detail._id}]`);
    let authKey = req.headers.authorization;

    return redisClient.del(authKey, (error) => {
      if (error) {
        this.logger.error(
          'An error occurred while removing the token from cache',
          {originalError: error, token: authKey}
        );
        return next(
          RuntimeError('An error occurred while logout from system')
        );
      }
      this.logger.info(`Logout request successfully completed for user id [${req.user_detail._id}]`);
      return res.status(STATUS_CODE.OK).json({message: 'User successfully logout from system'});
    });
  }
}

module.exports = AuthenticationService;