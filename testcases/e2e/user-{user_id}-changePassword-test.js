'use strict';
const config = require('config');
const chai = require('chai');
const ZSchema = require('z-schema');
const validator = new ZSchema({});
const request = require('request');
const asyncLib = require('async');
const {zSchemaCustomFormat, defaultErrorResponseSchema} = require('../../utils/TestUtils');
zSchemaCustomFormat(ZSchema);
const BASE_URL = `${config.get('BASE_URL')}:${config.get('APP_PORT')}`;
const {UserHelper} = require('./e2eHelper');
chai.should();

describe('/user/{user_id}/changePassword', function () {
  const userRoute = `${BASE_URL}/api/user`;
  const currentPassword = 'password123';
  const newPassword = 'newPassword123';
  const body = {
    current_password: currentPassword,
    new_password: newPassword
  };
  let userRecord;
  let records = [];
  const credentials = {
    password: currentPassword
  };
  before(function (done) {
    asyncLib.timesLimit(2, 1, (number, callback) => {
      UserHelper.createUser(credentials, (error, userData) => {
        if (error) {
          return callback(error);
        }
        if (!userRecord) {
          userRecord = userData;
        }
        records.push(userData);
        return callback();
      });
    }, done);
  });

  describe('put', function () {
    it('should respond with 200 Success response', function (done) {
      /*eslint-disable*/
      const schema = {
        "allOf": [
          {
            "type": "object",
            "required": [
              "_id",
              "updatedAt",
              "createdAt",
              "__v"
            ],
            "properties": {
              "_id": {
                "type": "string",
                "pattern": "^[a-f\\d]{24}$"
              },
              "updatedAt": {
                "type": "string",
                "format": "date-time"
              },
              "createdAt": {
                "type": "string",
                "format": "date-time"
              },
              "__v": {
                "type": "integer"
              }
            }
          },
          {
            "type": "object",
            "properties": {
              "email": {
                "type": "string",
                "format": "email"
              },
              "first_name": {
                "type": "string"
              },
              "last_name": {
                "type": "string"
              },
              "user_role": {
                "type": "string"
              },
              "dob": {
                "type": "string",
                "format": "date"
              }
            }
          }
        ]
      };

      /*eslint-enable*/
      request({
        url: `${userRoute}/${userRecord.body._id}/changePassword`,
        json: true,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: userRecord.headers.authorization
        },
        body: body
      },
      function (error, res, body) {
        if (error) {return done(error);}
        res.statusCode.should.equal(200);

        validator.validate(body, schema).should.be.true;
        done();
      });
    });

    it('should respond with 400 when invalid payload pass', function (done) {
      request({
        url: `${userRoute}/${userRecord.body._id}/changePassword`,
        json: true,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: userRecord.headers.authorization
        },
        body: {}
      },
      function (error, res, body) {
        if (error) {return done(error);}

        res.statusCode.should.equal(400);

        validator.validate(body, defaultErrorResponseSchema).should.be.true;
        done();
      });
    });

    it('should respond with 401 when invalid jwt token pass', function (done) {
      request({
        url: `${userRoute}/${userRecord.body._id}/changePassword`,
        json: true,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: 'someBadToken'
        },
        body: body
      },
      function (error, res, body) {
        if (error) {return done(error);}

        res.statusCode.should.equal(401);

        validator.validate(body, defaultErrorResponseSchema).should.be.true;
        done();
      });
    });

    it('should respond with 401 when invalid current password pass', function (done) {
      const body = {
        current_password: 'someInvalidPassword',
        new_password: newPassword
      };
      request({
        url: `${userRoute}/${userRecord.body._id}/changePassword`,
        json: true,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: 'someBadToken'
        },
        body: body
      },
      function (error, res, body) {
        if (error) {return done(error);}

        res.statusCode.should.equal(401);

        validator.validate(body, defaultErrorResponseSchema).should.be.true;
        done();
      });
    });

    it('should respond with 403 when non admin user try to change password for another user', function (done) {
      request({
        url: `${userRoute}/${userRecord.body._id}/changePassword`,
        json: true,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: records[1].headers.authorization
        },
        body: body
      },
      function (error, res, body) {
        if (error) {return done(error);}
        res.statusCode.should.equal(403);

        validator.validate(body, defaultErrorResponseSchema).should.be.true;
        done();
      });
    });
  });

});