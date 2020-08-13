'use strict';
const config = require('config');
const chai = require('chai');
const ZSchema = require('z-schema');
const validator = new ZSchema({});
const request = require('request');
const {zSchemaCustomFormat, defaultErrorResponseSchema} = require('../../utils/TestUtils');
zSchemaCustomFormat(ZSchema);
const BASE_URL = `${config.get('BASE_URL')}:${config.get('APP_PORT')}`;
const {UserHelper} = require('./e2eHelper');

chai.should();

describe('/login', function () {
  const loginUrl = `${BASE_URL}/api/login`;
  const email = `test${Date.now()}@test.com`;
  const credentials = {
    email,
    password: 'password123'
  };
  before(function (done) {
    UserHelper.createUser(credentials, (error) => {
      if (error) {
        return done(error);
      }
      return done();
    });
  });

  describe('post', function () {
    it('should respond with 200 Success response structure...', function (done) {
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
        url: loginUrl,
        json: true,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: credentials
      },
      function (error, res, body) {
        if (error) {return done(error);}

        res.statusCode.should.equal(200);

        validator.validate(body, schema).should.be.true;
        done();
      });
    });

    it('should respond with 400 validation error when user pass the empty payload', function (done) {
      request({
        url: loginUrl,
        json: true,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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

    it('should respond with 400 validation error when user pass the invalid payload', function (done) {
      const credentials = {
        email: `test${Date.now()}`,
        password: 'passw'
      };
      request({
        url: loginUrl,
        json: true,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: credentials
      },
      function (error, res, body) {
        if (error) {return done(error);}

        res.statusCode.should.equal(400);

        validator.validate(body, defaultErrorResponseSchema).should.be.true;
        done();
      });
    });

    it('should respond with 401 unauthorized error', function (done) {
      const credentials = {
        email,
        password: 'password6y68y83'
      };
      request({
        url: loginUrl,
        json: true,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: credentials
      },
      function (error, res, body) {
        if (error) {return done(error);}

        res.statusCode.should.equal(401);

        validator.validate(body, defaultErrorResponseSchema).should.be.true;
        done();
      });
    });

    it('should respond with 404 resource not found error', function (done) {
      const credentials = {
        email: `test${Date.now()}@test.com`,
        password: 'password6y68y83'
      };
      request({
        url: loginUrl,
        json: true,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: credentials
      },
      function (error, res, body) {
        if (error) {return done(error);}

        res.statusCode.should.equal(404);

        validator.validate(body, defaultErrorResponseSchema).should.be.true;
        done();
      });
    });
  });
});