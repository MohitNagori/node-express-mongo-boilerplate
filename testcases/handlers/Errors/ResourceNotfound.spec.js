'use strict';
const {assert} = require('chai');
const {Error} = require('../../../handlers');

/**
 * @TestSuite ResourcNotfound
 * @description - Test the resource not found error handler
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
describe('ResourcNotfound Error Handler Test scenario', () => {

  it('Test the ResourceNotfound error handler', () => {
    const errorMessage = 'User does not found for user id [xyz]';
    const expectedResourceNotfoundError = {
      code: 'NOT_FOUND',
      message: errorMessage,
      statusCode: 404
    };
    assert.deepEqual(
      Error.ResourceNotfound(errorMessage),
      expectedResourceNotfoundError,
      'ResourceNotfound error handler not work as expected'
    );
  });
});