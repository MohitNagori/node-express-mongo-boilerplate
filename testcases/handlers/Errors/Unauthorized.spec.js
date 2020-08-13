'use strict';
const {assert} = require('chai');
const {Error} = require('../../../handlers');

/**
 * @TestSuite Unauthorized Error
 * @description - Test the unauthorized error handler
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
describe('Unauthorized Error Handler Test scenario', () => {

  it('Test the Unauthorized error handler', () => {
    const errorMessage = 'Invalid credentials found';
    const expectedUnauthorizedError = {
      code: 'UNAUTHORIZED',
      message: errorMessage,
      statusCode: 401
    };
    assert.deepEqual(
      Error.Unauthorized(errorMessage),
      expectedUnauthorizedError,
      'Unauthorized error handler not work as expected'
    );
  });
});