'use strict';
const jwt = require('jsonwebtoken');
const config = require('config');
const jwtConfig = config.get('JWT');
const {Unauthorized, RuntimeError} = require('../handlers/Errors');

/**
 * @module jwt-Helper
 * @description - jwt sign and verification functions
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
module.exports = {
  /**
   * @method sign
   * @description - Provide jwt token for the authentication
   *
   * @param {Object} payload - The user payload
   * @param {Object} logger - The logger object
   * @param {Object} redisClient - The redis client to perform operation with redis
   * @param {function} callback - The callback use to pass the result async.
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  sign: (payload, logger, redisClient, callback) => {
    let tokenPayload = {
      email: payload.email,
      id: payload._id,
      role: payload.user_role
    };
    let token = jwt.sign(tokenPayload, jwtConfig.secret, jwtConfig.options);
    return redisClient.setex(token, jwtConfig.options.expiresIn, JSON.stringify(payload), (err) => {
      if (err) {
        logger.error(
          'An error occurred while caching the authentication token',
          {originalError: err}
        );
        return callback(err);
      }
      return callback(null, token);
    });
  },

  /**
   * @method verify
   * @description - Provide jwt token verification functionality
   *
   * @param {String} token - The jwt token
   * @param {Object} logger - The logger object
   * @param {Object} redisClient - The redis client to perform operation with redis
   * @param {RequestObject} req - Incoming request object
   * @param (function) next - pass request to next middleware or handler
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  verify: (token, logger, redisClient, req, next) => {
    if (!token) {
      logger.verbose('Request does not contains the required jwt token in header');
      return next(Unauthorized('Access token not found'));
    }
    return jwt.verify(token, jwtConfig.secret, (error, decoded) => {
      if (error) {
        logger.error(
          'An error occurred while authenticating the token',
          {originalError: error}
        );
        return next(Unauthorized('Invalid access token found'));
      }
      return redisClient.get(token, (err, user) => {
        if (err) {
          logger.error(
            `An error occurred while retrieving the verification token from caching for 
            user id [${decoded.id}] and email address [${decoded.email}]`,
            {originalError: err, token}
          );
          return next(RuntimeError('An error occurred while verifying the access token'));
        }
        user = user ? JSON.parse(user) : undefined;
        if (!user || (user._id !== decoded.id || user.email !== decoded.email)) {
          logger.verbose(
            `An error occurred during the verification of token in caching for 
            user id [${decoded.id}] and email address [${decoded.email}]`,
            {tokenUserData: decoded, token}
          );
          return next(Unauthorized('Given token has been expired'));
        }
        req.user_detail = user;
        return next();
      });
    });
  }
};