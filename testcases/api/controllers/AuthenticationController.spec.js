'use strict';
const sinon = require('sinon');
const {assert} = require('chai');
const {AuthenticationService} = require('../../../api/services');
const {AuthenticationController} = require('../../../api/controllers');

/**
 * @TestSuite Authentication Controller
 * @description - Expose the Authentication Controller functions
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
describe('AuthenticationController Module:- Test scenarios', () => {
  afterEach(() => {
    sinon.restore();
  });

  /**
   * @TestSuite login method
   * @description - Test the login functionality of Authentication controller
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('login() Method:- Test scenarios', () => {
    it('Test the scenario where create the service instance and call the service method', (done) => {
      const req = {
        logger: {},
        swagger: {
          params: {}
        }
      };
      const res = {};
      const nextSpy = sinon.spy();
      sinon.stub(AuthenticationService.prototype, 'login')
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
      AuthenticationController.login(req, res, nextSpy);
    });
  });

  /**
   * @TestSuite logout method
   * @description - Test the logout functionality of Authentication controller
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('logout() Method:- Test scenarios', () => {
    it('Test the scenario where create the service instance and call the service method', (done) => {
      const req = {};
      const res = {};
      const nextSpy = sinon.spy();
      sinon.stub(AuthenticationService.prototype, 'logout')
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
      AuthenticationController.logout(req, res, nextSpy);
    });
  });
});