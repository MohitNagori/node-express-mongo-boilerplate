'use strict';
const {assert} = require('chai');
const {Error} = require('../../../handlers');

/**
 * @TestSuite ValidationError
 * @description - Test the validation error handlers
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
describe('Validation Error Handler Test scenario', () => {

  it('Test the Validation error handler', () => {
    const errorMessage = 'User validation failed';
    const errors = [{
      'message': 'An email address is already register for some other user',
      'path': ['registration_body', 'email']
    }];
    const expectedValidationError = {
      code: 'FAILED_TO_VALIDATE',
      message: errorMessage,
      errors: errors,
      statusCode: 400
    };
    assert.deepEqual(
      Error.ValidationError(errorMessage, errors),
      expectedValidationError,
      'Validation error handler not work as expected'
    );
  });
});