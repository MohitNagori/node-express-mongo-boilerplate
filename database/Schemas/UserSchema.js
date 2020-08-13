'use strict';
const _ = require('lodash');
const moment = require('moment');
const mongoose = require('mongoose');
const crypto = require('crypto');
const {Schema} = mongoose;

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  hash: String,
  salt: String,
  first_name: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  user_role: {
    type: String,
    default: 'User'
  }
}, {
  timestamps: true,
  collection: 'Users'
});

/**
 * @method setPassword
 * @description - set a SHA password for a user.
 *
 * @param {string} password - Raw string format user password
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 *
 * @returns {void}
 */
UserSchema.methods.setPassword = function setPassword(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  // eslint-disable-next-line no-sync
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

/**
 * @method validatePassword
 * @description - Validate the password for user.
 *
 * @param {string} password - Raw string format user password
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 *
 * @returns {boolean} - Return the result of user's password comparision
 */
UserSchema.methods.validatePassword = function validatePassword(password) {
  // eslint-disable-next-line no-sync
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

/**
 * @method getUserDetail
 * @description - Transform and return the user detail without security fields.
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 *
 * @returns {object} - Return the result of user detail without security fields
 */
UserSchema.methods.getUserDetail = function getUserDetail() {
  const userDetail = this.toObject();
  userDetail.dob = moment(userDetail.dob).format('YYYY-MM-DD').toString();
  return _.omit(userDetail, ['salt', 'hash']);
};

/**
 * @module UsersModelSchema
 * @description - Expose the user model over the system
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
module.exports = mongoose.model('Users', UserSchema);
