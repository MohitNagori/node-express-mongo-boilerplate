'use strict';
const _ = require('lodash');
const sinon = require('sinon');
const {assert} = require('chai');
const ObjectId = require('mongoose').Types.ObjectId;
const {AuthenticationService} = require('../../../api/services');
const {DbOperationHelper, dbSchemas} = require('../../../database');
const {logger} = require('../../../utils/TestUtils');
const {jwtHelper} = require('../../../helpers');
const {redisClient} = require('../../../index');
const {UserSchema} = dbSchemas;

/**
 * @TestSuite AuthenticationService
 * @description - Test the AuthenticationService class
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
describe('AuthenticationService Class:- Test Scenarios', () => {
  let loggerSpy = null;
  beforeEach(() => {
    loggerSpy = sinon.spy();
  });
  afterEach(() => {
    sinon.restore();
  });

  /**
   * @TestSuite login()
   * @description - Test the login functionality of AuthenticationService
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('login() Method:- Test Scenario', () => {
    const email = 'test@test.com';
    let swaggerParams = {
      credentials: {
        value: {
          email: email,
          password: 'test1234'
        }
      }
    };
    const expectedFindOneOptions = {
      query: {
        email: email
      },
      queryOptions: {},
      isLean: false
    };
    const userData = new UserSchema({
      '_id': new ObjectId(),
      'user_role': 'User',
      'first_name': 'String',
      'last_name': 'String',
      'email': 'user@example.com',
      'dob': new Date(),
      'createdAt': '2019-07-21T00:37:33.328+05:30',
      'updatedAt': '2019-07-21T00:37:33.328+05:30',
      '__v': 0
    });

    it('Test the runtime error while retrieving user details for login', (done) => {
      const dbError = {error: 'someError'};
      const expectedResponseError = {
        message: `An error occurred while retrieving user detail for email address [${email}]`,
        statusCode: 500
      };
      sinon.stub(DbOperationHelper.prototype, 'findOne')
        .callsFake((schema, options, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected schema does not match to perform findOne operation'
          );
          assert.deepEqual(
            options,
            expectedFindOneOptions,
            'Expected findOne method options does not match'
          );
          return callback(dbError);
        });
      const nextSpy = sinon.spy((resError) => {
        assert.deepEqual(
          resError,
          expectedResponseError,
          'Expected response error does not match'
        );
        assert.isAtLeast(loggerSpy.callCount, 1, 'Expected logger have to be called once');
        done();
      });
      const res = {};

      let service = new AuthenticationService(logger(loggerSpy));
      service.login(swaggerParams, res, nextSpy);
    });

    it('Test the user not found scenario while retrieving user details for login', (done) => {
      const expectedResponseError = {
        code: 'NOT_FOUND',
        message: `User not found with email address [${email}]`,
        statusCode: 404
      };
      sinon.stub(DbOperationHelper.prototype, 'findOne')
        .callsFake((schema, options, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected schema does not match to perform findOne operation'
          );
          assert.deepEqual(
            options,
            expectedFindOneOptions,
            'Expected findOne method options does not match'
          );
          return callback();
        });
      const nextSpy = sinon.spy((resError) => {
        assert.deepEqual(
          resError,
          expectedResponseError,
          'Expected response error does not match'
        );
        assert.isAtLeast(loggerSpy.callCount, 1, 'Expected logger have to be called once');
        done();
      });
      const res = {};

      let service = new AuthenticationService(logger(loggerSpy));
      service.login(swaggerParams, res, nextSpy);
    });

    it('Test the scenario while user pass the invalid credential for login', (done) => {
      const expectedResponseError = {
        code: 'UNAUTHORIZED',
        message: 'Invalid user credentials found',
        statusCode: 401
      };

      sinon.stub(DbOperationHelper.prototype, 'findOne')
        .callsFake((schema, options, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected schema does not match to perform findOne operation'
          );
          assert.deepEqual(
            options,
            expectedFindOneOptions,
            'Expected findOne method options does not match'
          );
          return callback(null, userData);
        });
      sinon.stub(UserSchema.prototype, 'validatePassword')
        .callsFake((password) => {
          assert.equal(password, swaggerParams.credentials.value.password, 'Expected password does not pass');
          return false;
        });
      const nextSpy = sinon.spy((resError) => {
        assert.deepEqual(
          resError,
          expectedResponseError,
          'Expected response error does not match'
        );
        assert.isAtLeast(loggerSpy.callCount, 1, 'Expected logger have to be called once');
        done();
      });
      const res = {};

      let service = new AuthenticationService(logger(loggerSpy));
      service.login(swaggerParams, res, nextSpy);
    });

    it('Test the runtime error while generating the jwt token', (done) => {
      const jwtError = {error: 'someError'};
      const expectedResponseError = {
        message: `An error occurred during generating the jwt token for email address [${email}]`,
        statusCode: 500
      };
      sinon.stub(DbOperationHelper.prototype, 'findOne')
        .callsFake((schema, options, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected schema does not match to perform findOne operation'
          );
          assert.deepEqual(
            options,
            expectedFindOneOptions,
            'Expected findOne method options does not match'
          );
          return callback(null, userData);
        });

      sinon.stub(UserSchema.prototype, 'validatePassword')
        .callsFake((password) => {
          assert.equal(password, swaggerParams.credentials.value.password, 'Expected password does not pass');
          return true;
        });

      sinon.stub(jwtHelper, 'sign')
        .callsFake((userDetail, loggerObj, _redisClient, callback) => {
          assert.deepEqual(
            userDetail,
            userData.getUserDetail(),
            'Expected user data does not match'
          );
          return callback(jwtError);
        });
      const nextSpy = sinon.spy((resError) => {
        assert.deepEqual(
          resError,
          expectedResponseError,
          'Expected response error does not match'
        );
        assert.isAtLeast(loggerSpy.callCount, 1, 'Expected logger have to be called once');
        done();
      });
      const res = {};

      let service = new AuthenticationService(logger(loggerSpy));
      service.login(swaggerParams, res, nextSpy);
    });

    it('Test the success scenario of login', (done) => {
      const jwtToken = 'someToken';
      const expectedAuthHeader = {
        authorization: jwtToken
      };
      sinon.stub(DbOperationHelper.prototype, 'findOne')
        .callsFake((schema, options, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected schema does not match to perform findOne operation'
          );
          assert.deepEqual(
            options,
            expectedFindOneOptions,
            'Expected findOne method options does not match'
          );
          return callback(null, userData);
        });

      sinon.stub(UserSchema.prototype, 'validatePassword')
        .callsFake((password) => {
          assert.equal(password, swaggerParams.credentials.value.password, 'Expected password does not pass');
          return true;
        });

      sinon.stub(jwtHelper, 'sign')
        .callsFake((userDetail, loggerObj, _redisClient, callback) => {
          assert.deepEqual(
            userDetail,
            userData.getUserDetail(),
            'Expected user data does not match'
          );
          return callback(null, jwtToken);
        });
      const nextSpy = sinon.spy();
      const successSpy = sinon.spy((response) => {
        assert.deepEqual(
          response,
          userData.getUserDetail(),
          'Expected response does not match'
        );
        assert.isAtLeast(loggerSpy.callCount, 1, 'Expected logger have to be called once');
        done();
      });
      const statusSpy = sinon.spy((statusCode) => {
        assert.equal(
          statusCode,
          200,
          'Expected status code does not match'
        );
        return res;
      });
      const headerSpy = sinon.spy((key, value) => {
        assert.deepEqual(
          _.set({}, key, value),
          expectedAuthHeader,
          'Expected header does not match'
        );
      });
      const res = {
        setHeader: headerSpy,
        status: statusSpy,
        json: successSpy
      };

      let service = new AuthenticationService(logger(loggerSpy));
      service.login(swaggerParams, res, nextSpy);
    });
  });

  /**
   * @TestSuite logout()
   * @description - Test the logout functionality of AuthenticationService
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('logout() Method: Test Scenario', () => {
    const req = {
      headers: {
        authorization: 'someToken'
      },
      user_detail: {
        _id: new ObjectId()
      }
    };
    it('Test the runtime error occurred while removing token from redis', (done) => {
      const error = {
        message: 'someError'
      };
      const expectedRuntimeError = {
        message: 'An error occurred while logout from system',
        statusCode: 500
      };
      const res = {};
      sinon.stub(redisClient, 'del')
        .callsFake((authKey, callback) => {
          assert.equal(authKey, req.headers.authorization, 'Authorization key not match');
          callback(error);
        });

      const nextSpy = sinon.spy((error) => {
        assert.deepEqual(
          error,
          expectedRuntimeError,
          'Expected runtime error does not match'
        );
        done();
      });
      const service = new AuthenticationService(logger(loggerSpy));
      service.logout(req, res, nextSpy);
    });

    it('Test the success scenario to logging out the user from system', (done) => {
      const expectedResponse = {
        message: 'User successfully logout from system'
      };
      const res = {
        status: (statusCode) => {
          assert.equal(statusCode, 200, 'Response status code does not match');
          return res;
        },
        json: (data) => {
          assert.deepEqual(
            data,
            expectedResponse,
            'Response does not match for logout'
          );
          done();
        }
      };
      sinon.stub(redisClient, 'del')
        .callsFake((authKey, callback) => {
          assert.equal(authKey, req.headers.authorization, 'Authorization key not match');
          callback(null);
        });

      const nextSpy = sinon.spy();
      const service = new AuthenticationService(logger(loggerSpy));
      service.logout(req, res, nextSpy);
    });
  });
});