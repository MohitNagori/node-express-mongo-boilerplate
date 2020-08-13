'use strict';
const sinon = require('sinon');
const {assert} = require('chai');
const {Error} = require('../../../handlers');

/**
 * @TestSuite ErrorHandler
 * @description - Test the error handlers
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
describe('ErrorHandler Test scenario', () => {

  it('Test the ErrorHandler when status code takes from errorObject and error takes from errorObject.results.errors',
    (done) => {
      const errorObject = {
        statusCode: 400,
        message: 'You are looking for resource that not found',
        code: 'EMAILLD_ALREADY_IN_USE',
        results: {
          errors: [{
            'message': 'An email address is already register for some other user',
            'path': ['registration_body', 'email']
          }]
        }
      };

      const expectedErrorHandlerError = {
        code: errorObject.code,
        message: errorObject.message,
        errors: errorObject.results.errors
      };
      const statusSpy = sinon.spy((statusCode) => {
        assert.equal(statusCode, errorObject.statusCode, 'Expected status code does not match');
        return res;
      });
      const jsonSpy = sinon.spy((error) => {
        assert.deepEqual(error, expectedErrorHandlerError, 'Expected error does not match');
        return done();
      });
      const req = {};
      const res = {
        status: statusSpy,
        json: jsonSpy
      };
      Error.ErrorHandler(errorObject, req, res);
    });

  it('Test the ErrorHandler when status code takes from response and error takes from errorObject.errors', (done) => {
    const errorObject = {
      message: 'You are looking for resource that not found',
      code: 'EMAILLD_ALREADY_IN_USE',
      errors: [{
        'message': 'An email address is already register for some other user',
        'path': ['registration_body', 'email']
      }]
    };
    const expectedErrorHandlerError = {
      code: errorObject.code,
      message: errorObject.message,
      errors: errorObject.errors
    };
    const statusSpy = sinon.spy((statusCode) => {
      assert.equal(statusCode, res.statusCode, 'Expected status code does not match');
      return res;
    });
    const jsonSpy = sinon.spy((error) => {
      assert.deepEqual(error, expectedErrorHandlerError, 'Expected error does not match');
      return done();
    });
    const req = {};
    const res = {
      status: statusSpy,
      json: jsonSpy,
      statusCode: 400
    };
    Error.ErrorHandler(errorObject, req, res);
  });
});