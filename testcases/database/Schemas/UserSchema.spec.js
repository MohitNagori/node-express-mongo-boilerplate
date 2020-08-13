'use strict';
const moment = require('moment');
const {assert} = require('chai');
const {dbSchemas} = require('../../../database');
const {UserSchema} = dbSchemas;

/**
 * @TestSuite UserSchema
 * @description - Test the user schema methods
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
describe('User schema Module:- Test Scenarios', () => {
  const password = 'somePassword';
  const dob = new Date();
  let userRecord = new UserSchema({
    first_name: 'someFirstName',
    last_name: 'someLastName',
    email: 'someEmail@gmail.com',
    dob: dob
  });

  it('Test the setPassword method of user schema', () => {
    userRecord.setPassword(password);
    assert.isDefined(userRecord.salt, 'Expected salt property have to be set for password');
    assert.isDefined(userRecord.hash, 'Expected hash property have to be set for password');
  });

  it('Test the success scenario of validatePassword method of user schema', () => {
    assert.isTrue(userRecord.validatePassword(password), 'Expected password have to be match');
  });

  it('Test the failure scenario of validatePassword method of user schema', () => {
    assert.isFalse(userRecord.validatePassword('someInvalidPassword'), 'Expected password does not have to be match');
  });

  it('Test the getUserDetail method of user schema', () => {
    const expectedUserDetail = {
      first_name: 'someFirstName',
      last_name: 'someLastName',
      email: 'someEmail@gmail.com',
      dob: moment(dob).format('YYYY-MM-DD').toString(),
      user_role: 'User',
      _id: userRecord._id
    };
    assert.deepEqual(
      userRecord.getUserDetail(),
      expectedUserDetail,
      'Expected user details does not match'
    );
  });
});