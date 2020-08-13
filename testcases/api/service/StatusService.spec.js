'use strict';
const {assert} = require('chai');
const sinon = require('sinon');
const {StatusService} = require('../../../api/services');
const {logger} = require('../../../utils/TestUtils');

/**
 * @TestSuite StatusService
 * @description - Test the StatusService class
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
describe('StatusService Class:- Test Scenarios', () => {
  let logSpy;
  beforeEach(() => {
    logSpy = sinon.spy();
  });
  afterEach(() => {
    sinon.restore();
    logSpy = null;
  });

  /**
   * @TestSuite getSystemStatus()
   * @description - Test the system status functionality of StatusService
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('getSystemStatus() Method:- test scenarios', () => {

    it('Test the success scenario to get system status', (done) => {
      const expectedStatusCode = 200;
      const expectedResponseMsg = 'System is working fine';
      const statusSpy = sinon.spy((statusCode) => {
        assert.equal(
          statusCode,
          expectedStatusCode,
          'Expected status code does not match'
        );
        return res;
      });
      const jsonSpy = sinon.spy((response) => {
        assert.equal(
          response.message,
          expectedResponseMsg,
          'Expected response message does not match'
        );
        assert.isAtLeast(logSpy.callCount, 1, 'Expected logger to be called once');
        done();
      });
      const res = {
        status: statusSpy,
        json: jsonSpy
      };
      const swaggerParams = {};
      const service = new StatusService(logger(logSpy));
      service.getSystemStatus(swaggerParams, res);
    });
  });
});