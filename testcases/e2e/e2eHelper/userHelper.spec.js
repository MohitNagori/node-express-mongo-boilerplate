'use strict';
const request = require('request');
const config = require('config');
const BASE_URL = `${config.get('BASE_URL')}:${config.get('APP_PORT')}`;

/**
 * @module user helper
 * @description - user routes related helper
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
module.exports = {
  /**
   * @method user create helper
   * @description - user routes related helper
   *
   * @param {Object} user - The user cred object
   * @param {function} callback - The callback function
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  createUser: (user, callback) => {
    const userUrl = `${BASE_URL}/api/user`;
    const userBody = Object.assign({
      first_name: 'firstName',
      last_name: 'lastName',
      email: `someemail${Date.now()}@test.com`,
      dob: '1993-07-10',
      password: 'password123'
    }, user);
    request({
      url: userUrl,
      json: true,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: userBody
    },
    function (error, res, body) {
      if (error) {
        return callback(error);
      }
      return callback(null, {
        body: body,
        headers: res.headers
      });
    });
  }
};