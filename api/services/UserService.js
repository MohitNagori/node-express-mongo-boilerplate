'use strict';
const moment = require('moment');
const _ = require('lodash');
const async = require('async');
const STATUS_CODE = require('http-status-codes');
const {RuntimeError, ResourceNotfound, ValidationError, PreConditionFailed} = require('../../handlers/Errors');
const {DbOperationHelper, dbSchemas} = require('../../database');
const {jwtHelper, QueryParamsAndPaginationHelper} = require('../../helpers');
const {redisClient} = require('../../index');
const {UserSchema} = dbSchemas;
const {DB_CONSTANT} = require('../../constants');

/**
 * @class UserService
 * @description - User crud functionality service
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
class UserService {

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
   * @method createUser
   * @description - Provide create user functionality into the system.
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
  createUser(swaggerParams, res, next) {
    let payload = swaggerParams.registration_body.value;
    this.logger.info(
      `User registration request received by service for email address [${payload.email}]`,
      {payload: payload}
    );

    let newUser = new UserSchema({
      first_name: _.upperFirst(payload.first_name),
      last_name: _.upperFirst(payload.last_name),
      email: payload.email,
      dob: payload.dob
    });
    newUser.setPassword(payload.password);
    return this.dbOperationHelper.save(newUser, false, (error, user) => {
      if (error) {
        if (error.code === DB_CONSTANT.DUPLICATE_KEY_ERROR) {
          return next(
            ValidationError(
              'An email address is already exist in a system, Please try another email address',
              [{
                'message': 'An email address is already register for some other user',
                'path': ['registration_body', 'email']
              }],
              'EMAIL_ADDRESS_DUPLICATION'
            )
          );
        }
        return next(
          RuntimeError(`An error occurred during registering user with email address [${payload.email}]`)
        );
      }
      let userResponse = user.getUserDetail();
      return jwtHelper.sign(userResponse, this.logger, redisClient, (error, token) => {
        if (error) {
          return next(
            RuntimeError(`An error occurred during generating the jwt token for email address [${payload.email}]`)
          );
        }
        this.logger.info(
          `Create user request successfully completed for email address [${payload.email}]`,
          {data: userResponse}
        );
        res.setHeader('authorization', token);
        return res.status(STATUS_CODE.CREATED).json(userResponse);
      });
    });
  }

  /**
   * @method getUserList
   * @description - Provide get list user functionality into the system.
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
  getUserList(req, res, next) {
    let swaggerParams = req.swagger.params;
    _.set(swaggerParams, 'first_name.value', _.upperFirst(_.get(swaggerParams, 'first_name.value', undefined)));
    _.set(swaggerParams, 'last_name.value', _.upperFirst(_.get(swaggerParams, 'last_name.value', undefined)));
    let query = QueryParamsAndPaginationHelper.buildQuery(swaggerParams);
    let sortBy = QueryParamsAndPaginationHelper.buildSortBy(swaggerParams);
    let page = swaggerParams.page.value;
    let itemsPerPage = swaggerParams.itemsPerPage.value;
    let paginationOption = {
      sortingObj: sortBy,
      page: page,
      itemsPerPage: itemsPerPage
    };

    this.logger.info(
      'User get list request received by service',
      {query: query, paginationOption: paginationOption}
    );
    const paginationOptions = {
      query: query,
      queryOptions: {},
      paginationOption: paginationOption
    };
    async.parallel({
      count: async.apply(this.dbOperationHelper.count, UserSchema, query),
      listData: async.apply(this.dbOperationHelper.pagination, UserSchema, paginationOptions)
    }, (error, result) => {
      if (error) {
        return next(
          RuntimeError('An error occurred while retrieving registered users list')
        );
      }
      res.setHeader('x-items-count', result.count);
      res.setHeader(
        'x-page-links',
        QueryParamsAndPaginationHelper.buildPageLink(req.url, page, itemsPerPage, result.count)
      );
      if (result.listData.length === 0) {
        this.logger.verbose(
          'No record found for get registered user list'
        );
        return res.status(STATUS_CODE.NO_CONTENT).end();
      }

      this.logger.info(
        'Get list of registered user request successfully completed'
      );
      let finalResult = _.map(result.listData, (record) => {
        record.dob = moment(record.dob).format('YYYY-MM-DD');
        return _.omit(record, ['salt', 'hash']);
      });
      return res.status(STATUS_CODE.OK).json(finalResult);
    });
  }

  /**
   * @method getUserById
   * @description - Provide get user by id functionality into the system.
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
  getUserById(swaggerParams, res, next) {
    const userId = swaggerParams.user_id.value;
    this.logger.info(`Get user by id request received for user id [${userId}]`);
    const findByIdOptions = {
      query: userId,
      queryOptions: {},
      isLean: true
    };
    return this.dbOperationHelper.findById(UserSchema, findByIdOptions, (error, user) => {
      if (error) {
        return next(
          RuntimeError(`An error occurred while retrieving the user detail for user id [${userId}]`)
        );
      }
      if (_.isEmpty(user)) {
        this.logger.verbose(`No record found for user with user id [${userId}]`);
        return next(
          ResourceNotfound(`No record found for user with user id [${userId}]`)
        );
      }
      // does not exposing the hash and salt
      user = _.omit(user, ['salt', 'hash']);
      this.logger.info(`Get user by id request successfully completed for user id [${userId}]`);
      return res.status(STATUS_CODE.OK).json(user);
    });
  }

  /**
   * @method deleteUserById
   * @description - Provide delete user by id functionality into the system.
   *
   * @param {RequestObject} req - Incoming request swagger params
   * @param {ResponseObject} res - The response object for incoming request
   * @param (function) next - pass request to next middleware or handler
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   *
   * @returns {void}
   */
  deleteUserById(req, res, next) {
    let userId = req.swagger.params.user_id.value;
    let authKey = req.headers.authorization;
    this.logger.info(`Delete user by id request received for user id [${userId}]`);

    let query = {
      _id: userId
    };

    return this.dbOperationHelper.findOneAndRemove(UserSchema, query, (error, user) => {
      if (error) {
        return next(
          RuntimeError(`An error occurred while deleting the user detail for user id [${userId}]`)
        );
      }
      if (_.isEmpty(user)) {
        this.logger.verbose(`No record found for user with user id [${userId}]`);
        return next(
          ResourceNotfound(`No record found for user with user id [${userId}]`)
        );
      }
      return redisClient.del(authKey, (error) => {
        if (error) {
          this.logger.error(
            `An error occurred while removing the token from cache 
            when user with user id [${userId}] deleted from system`,
            {originalError: error, token: authKey}
          );
        }
        this.logger.info(`Delete user by id request successfully completed for user id [${userId}]`);
        return res.status(STATUS_CODE.OK).json(user.getUserDetail());
      });
    });
  }

  /**
   * @method updateUserById
   * @description - Provide update user by id functionality into the system.
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
  updateUserById(swaggerParams, res, next) {
    let userId = swaggerParams.user_id.value;
    let payload = swaggerParams.update_body.value;
    this.logger.info(`Update user by id request received for user id [${userId}]`);
    if (_.isEmpty(payload)) {
      this.logger.warn(
        `Precondition failed while update the user for user id [${userId}]`
      );
      const conditionFailedErrors = [{
        message: 'User request payload have to be set at least one property to update',
        path: ['update_body']
      }];
      return next(
        PreConditionFailed('At least one property to be set for user update', conditionFailedErrors)
      );
    }
    const findByIdOptions = {
      query: userId,
      queryOptions: {},
      isLean: false
    };
    return this.dbOperationHelper.findById(UserSchema, findByIdOptions, (error, user) => {
      if (error) {
        return next(
          RuntimeError(`An error occurred while retrieving the user detail for user id [${userId}] to update`)
        );
      }
      if (_.isEmpty(user)) {
        this.logger.verbose(
          `No record found for user with user id [${userId}]`
        );
        return next(
          ResourceNotfound(`No record found for user with user id [${userId}]`)
        );
      }
      _.forOwn(payload, (value, key) => {
        user[key] = ['first_name', 'last_name'].includes(key) ? _.upperFirst(value) : value;
      });
      return this.dbOperationHelper.save(user, true, (error, updatedUser) => {
        if (error) {
          if (error.code === DB_CONSTANT.DUPLICATE_KEY_ERROR) {
            return next(
              ValidationError(
                'An email address is already exist in a system, Please try another email address',
                [{
                  'message': 'An email address is already register for some other user',
                  'path': ['registration_body', 'email']
                }],
                'EMAIL_ADDRESS_DUPLICATION'
              )
            );
          }
          return next(
            RuntimeError(`An error occurred while updating record for user [${userId}]`)
          );
        }
        this.logger.info(`Update user by id request successfully completed for user id [${userId}]`);
        return res.status(STATUS_CODE.OK).json(updatedUser.getUserDetail());
      });
    });
  }
}

module.exports = UserService;