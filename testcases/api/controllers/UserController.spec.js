'use strict';
const sinon = require('sinon');
const {assert} = require('chai');
const {UserService} = require('../../../api/services');
const {UserController} = require('../../../api/controllers');

/**
 * @TestSuite User Controller
 * @description - Expose the User Controller functions
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
describe('User Module:- Test scenarios', () => {
  afterEach(() => {
    sinon.restore();
  });

  /**
   * @TestSuite createUser method
   * @description - Test the create user functionality of User controller
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('createUser() Method:- Test scenarios', () => {
    it('Test the scenario where create the service instance and call the service method', (done) => {
      const req = {
        logger: {},
        swagger: {
          params: {}
        }
      };
      const res = {};
      const nextSpy = sinon.spy();
      sinon.stub(UserService.prototype, 'createUser')
        .callsFake((swaggerParams, response, next) => {
          assert.deepEqual(
            swaggerParams,
            req.swagger.params,
            'Expected swagger params does not match'
          );
          assert.deepEqual(response, res, 'Expected response object does not match');
          assert.isFunction(next, 'Expected next to be function');
          done();
        });
      UserController.createUser(req, res, nextSpy);
    });
  });

  /**
   * @TestSuite getUserList method
   * @description - Test the get user list functionality of User controller
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('getUserList() Method:- Test scenarios', () => {
    it('Test the scenario where create the service instance and call the service method', (done) => {
      const req = {};
      const res = {};
      const nextSpy = sinon.spy();
      sinon.stub(UserService.prototype, 'getUserList')
        .callsFake((swaggerParams, response, next) => {
          assert.deepEqual(
            swaggerParams,
            req,
            'Expected swagger params does not match'
          );
          assert.deepEqual(response, res, 'Expected response object does not match');
          assert.isFunction(next, 'Expected next to be function');
          done();
        });
      UserController.getUserList(req, res, nextSpy);
    });
  });

  /**
   * @TestSuite getUserById method
   * @description - Test the get user by id functionality of User controller
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('getUserById() Method:- Test scenarios', () => {
    it('Test the scenario where create the service instance and call the service method', (done) => {
      const req = {
        logger: {},
        swagger: {
          params: {}
        }
      };
      const res = {};
      const nextSpy = sinon.spy();
      sinon.stub(UserService.prototype, 'getUserById')
        .callsFake((swaggerParams, response, next) => {
          assert.deepEqual(
            swaggerParams,
            req.swagger.params,
            'Expected swagger params does not match'
          );
          assert.deepEqual(response, res, 'Expected response object does not match');
          assert.isFunction(next, 'Expected next to be function');
          done();
        });
      UserController.getUserById(req, res, nextSpy);
    });
  });

  /**
   * @TestSuite deleteUserById method
   * @description - Test the delete user by id functionality of User controller
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('deleteUserById() Method:- Test scenarios', () => {
    it('Test the scenario where create the service instance and call the service method', (done) => {
      const req = {};
      const res = {};
      const nextSpy = sinon.spy();
      sinon.stub(UserService.prototype, 'deleteUserById')
        .callsFake((swaggerParams, response, next) => {
          assert.deepEqual(
            swaggerParams,
            req,
            'Expected swagger params does not match'
          );
          assert.deepEqual(response, res, 'Expected response object does not match');
          assert.isFunction(next, 'Expected next to be function');
          done();
        });
      UserController.deleteUserById(req, res, nextSpy);
    });
  });

  /**
   * @TestSuite updateUserById method
   * @description - Test the update user by id functionality of User controller
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('updateUserById() Method:- Test scenarios', () => {
    it('Test the scenario where create the service instance and call the service method', (done) => {
      const req = {
        logger: {},
        swagger: {
          params: {}
        }
      };
      const res = {};
      const nextSpy = sinon.spy();
      sinon.stub(UserService.prototype, 'updateUserById')
        .callsFake((swaggerParams, response, next) => {
          assert.deepEqual(
            swaggerParams,
            req.swagger.params,
            'Expected swagger params does not match'
          );
          assert.deepEqual(response, res, 'Expected response object does not match');
          assert.isFunction(next, 'Expected next to be function');
          done();
        });
      UserController.updateUserById(req, res, nextSpy);
    });
  });
});