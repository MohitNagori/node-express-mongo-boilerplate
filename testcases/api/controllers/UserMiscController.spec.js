'use strict';
const sinon = require('sinon');
const {assert} = require('chai');
const {UserMiscService} = require('../../../api/services');
const {UserMiscController} = require('../../../api/controllers');

/**
 * @TestSuite User miscellaneous Controller
 * @description - Expose the User miscellaneous Controller functions
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
describe('UserMiscController Module:- Test scenarios', () => {
  afterEach(() => {
    sinon.restore();
  });

  /**
   * @TestSuite changePassword method
   * @description - Test the changePassword functionality of User miscellaneous controller
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('changePassword() Method:- Test scenarios', () => {
    it('Test the scenario where create the service instance and call the service method', (done) => {
      const req = {
        logger: {},
        swagger: {
          params: {}
        }
      };
      const res = {};
      const nextSpy = sinon.spy();
      sinon.stub(UserMiscService.prototype, 'changePassword')
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
      UserMiscController.changePassword(req, res, nextSpy);
    });
  });
});