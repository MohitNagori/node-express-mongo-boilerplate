'use strict';
const {assert} = require('chai');
const {Error} = require('../../../handlers');

/**
 * @TestSuite PreConditionFailed
 * @description - Test the pre condition failed error handler
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
describe('PreConditionFailed Error Handler Test scenario', () => {

  it('Test the PreConditionFailed error handler', () => {
    const errorMessage =
      'User does not have a permission to update user details as it\'s status required to be an active';
    const errors = [{
      'message': 'User have to be an active to update the user details',
      'path': ['registration_body']
    }];
    const expectedPreConditionFailedError = {
      code: 'PRECONDITION_FAILED',
      message: errorMessage,
      errors: errors,
      statusCode: 412
    };
    assert.deepEqual(
      Error.PreConditionFailed(errorMessage, errors),
      expectedPreConditionFailedError,
      'PreConditionFailed error handler not work as expected'
    );
  });
});