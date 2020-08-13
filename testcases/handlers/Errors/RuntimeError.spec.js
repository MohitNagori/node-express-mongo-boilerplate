'use strict';
const {assert} = require('chai');
const {Error} = require('../../../handlers');

/**
 * @TestSuite RuntimeError
 * @description - Test the runtime error handlers
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
describe('Runtime Error Handler Test scenario', () => {

  it('Test the Runtime error handler', () => {
    const errorMessage = 'Internal server error occurred while performing a db operation';
    const expectedRuntimeError = {
      message: errorMessage,
      statusCode: 500
    };
    assert.deepEqual(
      Error.RuntimeError(errorMessage),
      expectedRuntimeError,
      'Runtime error handler not work as expected'
    );
  });
});