'use strict';
const {assert} = require('chai');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const config = require('config');
const {jwtHelper} = require('../../helpers');
const {redisClient} = require('../../index');
const {logger} = require('../../utils/TestUtils');
const jwtConfig = config.get('JWT');

/**
 * @TestSuite jwt helper
 * @description - Test the jwt helper
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
describe('jwtHelper Module:- Test Scenarios', () => {
  let loggerSpy;
  beforeEach(() => {
    loggerSpy = sinon.spy();
  });
  afterEach(() => {
    sinon.restore();
  });

  /**
   * @TestSuite sign method
   * @description - Test the jwt sign method to generate token
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('sign() Method:- Test Scenarios', () => {
    const payload = {
      email: 'some@email.com',
      _id: 'someId',
      user_role: 'User'
    };
    const tokenPayload = {
      email: payload.email,
      id: payload._id,
      role: payload.user_role
    };

    it('Test the error scenario while set the token with payload in cache', (done) => {
      const expectedToken = 'someTestToken';
      const jwtError = {
        error: 'someJWTError'
      };

      sinon.stub(redisClient, 'setex')
        .callsFake((token, expireIn, jwtPayload, callback) => {
          assert.equal(
            token,
            expectedToken,
            'Expected token does not match'
          );
          assert.equal(
            expireIn,
            jwtConfig.options.expiresIn,
            'Expected jwt expires in does not match'
          );
          assert.deepEqual(
            jwtPayload,
            JSON.stringify(payload),
            'Expected token payload does not match'
          );
          return callback(jwtError);
        });

      sinon.stub(jwt, 'sign')
        .callsFake((_tokenPayload, secret, options) => {
          assert.deepEqual(
            _tokenPayload,
            tokenPayload,
            'Expected token payload does not match'
          );
          assert.equal(
            secret,
            jwtConfig.secret,
            'Expected jwt secret does not match'
          );
          assert.deepEqual(
            options,
            jwtConfig.options,
            'Expected jwt token options does not match'
          );
          return expectedToken;
        });

      const nextSpy = sinon.spy((error) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Expected logger to be called once');
        assert.deepEqual(
          error,
          jwtError,
          'Expected error does not match'
        );
        done();
      });
      jwtHelper.sign(payload, logger(loggerSpy), redisClient, nextSpy);
    });

    it('Test the success scenario of return a token', (done) => {
      const expectedToken = 'someTestToken';

      sinon.stub(redisClient, 'setex')
        .callsFake((token, expireIn, jwtPayload, callback) => {
          assert.equal(
            token,
            expectedToken,
            'Expected token does not match'
          );
          assert.equal(
            expireIn,
            jwtConfig.options.expiresIn,
            'Expected jwt expires in does not match'
          );
          assert.deepEqual(
            jwtPayload,
            JSON.stringify(payload),
            'Expected token payload does not match'
          );
          return callback(null, token);
        });

      sinon.stub(jwt, 'sign')
        .callsFake((_tokenPayload, secret, options) => {
          assert.deepEqual(
            _tokenPayload,
            tokenPayload,
            'Expected token payload does not match'
          );
          assert.equal(
            secret,
            jwtConfig.secret,
            'Expected jwt secret does not match'
          );
          assert.deepEqual(
            options,
            jwtConfig.options,
            'Expected jwt token options does not match'
          );
          return expectedToken;
        });

      const nextSpy = sinon.spy((error, _token) => {
        assert.equal(loggerSpy.callCount, 0, 'Expected logger not to be called');
        assert.isNull(error, 'Expected error have to be null');
        assert.equal(_token, expectedToken, 'Expected token does not match');
        done();
      });
      jwtHelper.sign(payload, logger(loggerSpy), redisClient, nextSpy);
    });
  });

  /**
   * @TestSuite verify method
   * @description - Test the jwt verify method to verified the request jwt token
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('verify() Method:- Test Scenarios', () => {

    it('Test the scenario when unauthorized error occurred when no token passed', (done) => {
      const expectedErrorResponse = {
        code: 'UNAUTHORIZED',
        message: 'Access token not found',
        statusCode: 401
      };
      const nextSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger should expected to be called at least once');
        assert.deepEqual(
          resError,
          expectedErrorResponse,
          'Expected error response does not match'
        );
        done();
      });
      jwtHelper.verify('', logger(loggerSpy), {}, {}, nextSpy);
    });

    it('Test the scenario when error occurred during the verification of request token', (done) => {
      const token = 'someToken';
      const jwtError = {
        error: 'someJWTError'
      };
      const expectedErrorResponse = {
        code: 'UNAUTHORIZED',
        message: 'Invalid access token found',
        statusCode: 401
      };

      sinon.stub(jwt, 'verify')
        .callsFake((_token, secret, callback) => {
          assert.equal(
            _token,
            token,
            'Expected token does not match'
          );
          assert.equal(
            jwtConfig.secret,
            secret,
            'Expected secret does not match'
          );
          return callback(jwtError);
        });
      const nextSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger should expected to be called at least once');
        assert.deepEqual(
          resError,
          expectedErrorResponse,
          'Expected error response does not match'
        );
        done();
      });
      jwtHelper.verify(token, logger(loggerSpy), {}, {}, nextSpy);
    });

    it('Test the scenario when error occurred during the verification in white list of token', (done) => {
      const token = 'someToken';
      const redisError = {
        error: 'someRedisError'
      };
      const decodedUser = {
        id: 'someId',
        email: 'someEmail'
      };
      const expectedErrorResponse = {
        message: 'An error occurred while verifying the access token',
        statusCode: 500
      };

      sinon.stub(jwt, 'verify')
        .callsFake((_token, secret, callback) => {
          assert.equal(
            _token,
            token,
            'Expected token does not match'
          );
          assert.equal(
            jwtConfig.secret,
            secret,
            'Expected secret does not match'
          );
          return callback(null, decodedUser);
        });
      sinon.stub(redisClient, 'get')
        .callsFake((_token, callback) => {
          assert.equal(_token, token, 'Expected request token does not match');
          return callback(redisError);
        });

      const nextSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger should expected to be called at least once');
        assert.deepEqual(
          resError,
          expectedErrorResponse,
          'Expected error response does not match'
        );
        done();
      });
      jwtHelper.verify(token, logger(loggerSpy), redisClient, {}, nextSpy);
    });

    it('Test the token expire scenario when user not found in cache', (done) => {
      const token = 'someToken';
      const decodedUser = {
        id: 'someId',
        email: 'someEmail'
      };
      const expectedErrorResponse = {
        code: 'UNAUTHORIZED',
        message: 'Given token has been expired',
        statusCode: 401
      };

      sinon.stub(jwt, 'verify')
        .callsFake((_token, secret, callback) => {
          assert.equal(
            _token,
            token,
            'Expected token does not match'
          );
          assert.equal(
            jwtConfig.secret,
            secret,
            'Expected secret does not match'
          );
          return callback(null, decodedUser);
        });
      sinon.stub(redisClient, 'get')
        .callsFake((_token, callback) => {
          assert.equal(_token, token, 'Expected request token does not match');
          return callback();
        });

      const nextSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger should expected to be called at least once');
        assert.deepEqual(
          resError,
          expectedErrorResponse,
          'Expected error response does not match'
        );
        done();
      });
      jwtHelper.verify(token, logger(loggerSpy), redisClient, {}, nextSpy);
    });

    it('Test the token expire scenario when user found in cache but user id not match', (done) => {
      const token = 'someToken';
      const decodedUser = {
        id: 'someId',
        email: 'someEmail'
      };
      const expectedErrorResponse = {
        code: 'UNAUTHORIZED',
        message: 'Given token has been expired',
        statusCode: 401
      };
      const cacheUserDetail = {
        _id: 'someOtherId'
      };

      sinon.stub(jwt, 'verify')
        .callsFake((_token, secret, callback) => {
          assert.equal(
            _token,
            token,
            'Expected token does not match'
          );
          assert.equal(
            jwtConfig.secret,
            secret,
            'Expected secret does not match'
          );
          return callback(null, decodedUser);
        });
      sinon.stub(redisClient, 'get')
        .callsFake((_token, callback) => {
          assert.equal(_token, token, 'Expected request token does not match');
          return callback(null, JSON.stringify(cacheUserDetail));
        });

      const nextSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger should expected to be called at least once');
        assert.deepEqual(
          resError,
          expectedErrorResponse,
          'Expected error response does not match'
        );
        done();
      });
      jwtHelper.verify(token, logger(loggerSpy), redisClient, {}, nextSpy);
    });

    it('Test the token expire scenario when user found in cache but user email not match', (done) => {
      const token = 'someToken';
      const decodedUser = {
        id: 'someId',
        email: 'someEmail'
      };
      const expectedErrorResponse = {
        code: 'UNAUTHORIZED',
        message: 'Given token has been expired',
        statusCode: 401
      };
      const cacheUserDetail = {
        _id: 'someId',
        email: 'someOtherEmail'
      };

      sinon.stub(jwt, 'verify')
        .callsFake((_token, secret, callback) => {
          assert.equal(
            _token,
            token,
            'Expected token does not match'
          );
          assert.equal(
            jwtConfig.secret,
            secret,
            'Expected secret does not match'
          );
          return callback(null, decodedUser);
        });
      sinon.stub(redisClient, 'get')
        .callsFake((_token, callback) => {
          assert.equal(_token, token, 'Expected request token does not match');
          return callback(null, JSON.stringify(cacheUserDetail));
        });

      const nextSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger should expected to be called at least once');
        assert.deepEqual(
          resError,
          expectedErrorResponse,
          'Expected error response does not match'
        );
        done();
      });
      jwtHelper.verify(token, logger(loggerSpy), redisClient, {}, nextSpy);
    });

    it('Test the success scenario when user successfully verified', (done) => {
      const token = 'someToken';
      const decodedUser = {
        id: 'someId',
        email: 'someEmail'
      };
      const cacheUserDetail = {
        _id: 'someId',
        email: 'someEmail'
      };
      const req = {};

      sinon.stub(jwt, 'verify')
        .callsFake((_token, secret, callback) => {
          assert.equal(
            _token,
            token,
            'Expected token does not match'
          );
          assert.equal(
            jwtConfig.secret,
            secret,
            'Expected secret does not match'
          );
          return callback(null, decodedUser);
        });
      sinon.stub(redisClient, 'get')
        .callsFake((_token, callback) => {
          assert.equal(_token, token, 'Expected request token does not match');
          return callback(null, JSON.stringify(cacheUserDetail));
        });

      const nextSpy = sinon.spy(() => {
        assert.equal(loggerSpy.callCount, 0, 'Logger should not expected to be called');
        assert.deepEqual(
          req.user_detail,
          cacheUserDetail,
          'Expected user details does not match'
        );
        done();
      });
      jwtHelper.verify(token, logger(loggerSpy), redisClient, req, nextSpy);
    });
  });
});