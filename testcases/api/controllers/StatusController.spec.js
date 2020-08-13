'use strict';
const sinon = require('sinon');
const {assert} = require('chai');
const {StatusService} = require('../../../api/services');
const {StatusController} = require('../../../api/controllers');

/**
 * @TestSuite Status Controller
 * @description - Expose the Status Controller functions
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
describe('StatusController Module:- Test Scenarios', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('Test the scenario where create the service instance and call the service method', (done) => {
    const req = {
      logger: {},
      swagger: {
        params: {}
      }
    };
    const res = {};
    sinon.stub(StatusService.prototype, 'getSystemStatus')
      .callsFake((swaggerParams, response) => {
        assert.deepEqual(
          swaggerParams,
          req.swagger.params,
          'Expected swagger params does not match'
        );
        assert.deepEqual(response, res, 'Expected response object does not match');
        done();
      });
    StatusController.getSystemStatus(req, res);
  });
});