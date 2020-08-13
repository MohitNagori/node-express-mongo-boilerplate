'use strict';
const {assert} = require('chai');
const sinon = require('sinon');
const ObjectId = require('mongoose').Types.ObjectId;
const {UserMiscService} = require('../../../api/services');
const {logger} = require('../../../utils/TestUtils');
const {DbOperationHelper, dbSchemas} = require('../../../database');
const {UserSchema} = dbSchemas;

/**
 * @TestSuite UserMiscService
 * @description - Test the UserMiscService class
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
describe('UserMiscService Class:- Test Scenarios', () => {
  let loggerSpy = null;
  beforeEach(() => {
    loggerSpy = sinon.spy();
  });
  afterEach(() => {
    sinon.restore();
  });

  /**
   * @TestSuite changePassword()
   * @description - Test the changePassword functionality of UserMiscService
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('changePassword() Method:- Test Scenarios', () => {
    const userId = new ObjectId();
    let swaggerParams = {
      change_password: {
        value: {
          current_password: 'currentPassword',
          new_password: 'someNewPassword'
        }
      },
      user_id: {
        value: userId
      }
    };
    const expectedFindByIdOptions = {
      query: userId,
      queryOptions: {},
      isLean: false
    };
    const userData = new UserSchema({
      '_id': userId,
      'user_role': 'User',
      'first_name': 'String',
      'last_name': 'String',
      'email': 'user@example.com',
      'dob': new Date(),
      'createdAt': '2019-07-21T00:37:33.328+05:30',
      'updatedAt': '2019-07-21T00:37:33.328+05:30',
      '__v': 0
    });

    it('Test the runtime error occurred while retrieving user details for change password', (done) => {
      const dbError = {error: 'someError'};
      const expectedResponseError = {
        message: `An error occurred while retrieving user record for user [${userId}]`,
        statusCode: 500
      };
      sinon.stub(DbOperationHelper.prototype, 'findById')
        .callsFake((schema, options, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected schema does not match to perform findById operation'
          );
          assert.deepEqual(
            options,
            expectedFindByIdOptions,
            'Expected findById method options does not match'
          );
          return callback(dbError);
        });
      const res = {};
      const nextSpy = sinon.spy((resError) => {
        assert.deepEqual(
          resError,
          expectedResponseError,
          'Expected response error does not match'
        );
        assert.isAtLeast(loggerSpy.callCount, 1, 'Expected logger have to be called once');
        done();
      });
      const service = new UserMiscService(logger(loggerSpy));
      service.changePassword(swaggerParams, res, nextSpy);
    });

    it('Test the resource not found error occurred while retrieving user details for change password', (done) => {
      const expectedResponseError = {
        code: 'NOT_FOUND',
        message: `User not found for user id [${userId}]`,
        statusCode: 404
      };
      sinon.stub(DbOperationHelper.prototype, 'findById')
        .callsFake((schema, options, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected schema does not match to perform findById operation'
          );
          assert.deepEqual(
            options,
            expectedFindByIdOptions,
            'Expected findById method options does not match'
          );
          return callback();
        });
      const res = {};
      const nextSpy = sinon.spy((resError) => {
        assert.deepEqual(
          resError,
          expectedResponseError,
          'Expected response error does not match'
        );
        assert.isAtLeast(loggerSpy.callCount, 1, 'Expected logger have to be called once');
        done();
      });
      const service = new UserMiscService(logger(loggerSpy));
      service.changePassword(swaggerParams, res, nextSpy);
    });

    it('Test the unauthorized error occurred while user\'s current password does not match for change password',
      (done) => {
        const expectedResponseError = {
          code: 'UNAUTHORIZED',
          message: 'Credentials does not match. Please try again',
          statusCode: 401
        };

        sinon.stub(DbOperationHelper.prototype, 'findById')
          .callsFake((schema, options, callback) => {
            assert.deepEqual(
              schema,
              UserSchema,
              'Expected schema does not match to perform findById operation'
            );
            assert.deepEqual(
              options,
              expectedFindByIdOptions,
              'Expected findById method options does not match'
            );
            return callback(null, userData);
          });
        sinon.stub(UserSchema.prototype, 'validatePassword')
          .callsFake((password) => {
            assert.equal(
              password,
              swaggerParams.change_password.value.current_password,
              'Expected password does not pass'
            );
            return false;
          });

        const res = {};
        const nextSpy = sinon.spy((resError) => {
          assert.deepEqual(
            resError,
            expectedResponseError,
            'Expected response error does not match'
          );
          assert.isAtLeast(loggerSpy.callCount, 1, 'Expected logger have to be called once');
          done();
        });
        const service = new UserMiscService(logger(loggerSpy));
        service.changePassword(swaggerParams, res, nextSpy);
      });

    it('Test the runtime error occurred while updating a password using change password', (done) => {
      const dbError = {error: 'someDbError'};
      const expectedResponseError = {
        message: `An error occurred while updating user's password for user id [${userId}]`,
        statusCode: 500
      };
      sinon.stub(UserSchema.prototype, 'validatePassword')
        .callsFake((password) => {
          assert.equal(
            password,
            swaggerParams.change_password.value.current_password,
            'Expected password does not pass'
          );
          return true;
        });
      sinon.stub(DbOperationHelper.prototype, 'findById')
        .callsFake((schema, options, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected schema does not match to perform findById operation'
          );
          assert.deepEqual(
            options,
            expectedFindByIdOptions,
            'Expected findById method options does not match'
          );
          return callback(null, userData);
        });
      sinon.stub(DbOperationHelper.prototype, 'save')
        .callsFake((_userResponse, isForUpdate, callback) => {
          assert.deepEqual(
            _userResponse.getUserDetail(),
            userData.getUserDetail(),
            'Expected user record does not match to perform save operation'
          );
          assert.isTrue(
            isForUpdate,
            'Expected is for update flag does not match'
          );
          return callback(dbError);
        });
      const res = {};
      const nextSpy = sinon.spy((resError) => {
        assert.deepEqual(
          resError,
          expectedResponseError,
          'Expected response error does not match'
        );
        assert.isAtLeast(loggerSpy.callCount, 1, 'Expected logger have to be called once');
        done();
      });
      const service = new UserMiscService(logger(loggerSpy));
      service.changePassword(swaggerParams, res, nextSpy);
    });

    it('Test the success scenario for change password', (done) => {
      sinon.stub(UserSchema.prototype, 'validatePassword')
        .callsFake((password) => {
          assert.equal(
            password,
            swaggerParams.change_password.value.current_password,
            'Expected password does not pass'
          );
          return true;
        });
      sinon.stub(DbOperationHelper.prototype, 'findById')
        .callsFake((schema, options, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected schema does not match to perform findById operation'
          );
          assert.deepEqual(
            options,
            expectedFindByIdOptions,
            'Expected findById method options does not match'
          );
          return callback(null, userData);
        });
      sinon.stub(DbOperationHelper.prototype, 'save')
        .callsFake((_userResponse, isForUpdate, callback) => {
          assert.deepEqual(
            _userResponse.getUserDetail(),
            userData.getUserDetail(),
            'Expected user record does not match to perform save operation'
          );
          assert.isTrue(
            isForUpdate,
            'Expected is for update flag does not match'
          );
          return callback(null, userData);
        });

      const statusSpy = sinon.spy((statusCode) => {
        assert.equal(statusCode, 200, 'Expected status code does not match for response');
        return res;
      });

      const jsonSpy = sinon.spy((response) => {
        assert.equal(nextSpy.callCount, 0, 'Expected next not to be called in success');
        assert.isAtLeast(loggerSpy.callCount, 1, 'Expected logger have to be called once');
        assert.deepEqual(
          response,
          userData.getUserDetail()
        );
        done();
      });
      const res = {
        status: statusSpy,
        json: jsonSpy
      };
      const nextSpy = sinon.spy();
      const service = new UserMiscService(logger(loggerSpy));
      service.changePassword(swaggerParams, res, nextSpy);
    });
  });
});