'use strict';
const chai = require('chai');
const ZSchema = require('z-schema');
const request = require('request');
const config = require('config');
const {zSchemaCustomFormat, defaultErrorResponseSchema} = require('../../utils/TestUtils');
zSchemaCustomFormat(ZSchema);
const validator = new ZSchema({});
const BASE_URL = `${config.get('BASE_URL')}:${config.get('APP_PORT')}`;
chai.should();

describe('/user', function () {
  let authHeader;
  const userUrl = `${BASE_URL}/api/user`;

  describe('post', function () {
    const userBody = {
      first_name: 'firstName',
      last_name: 'lastName',
      email: 'someemail@test.com',
      dob: '1993-07-10',
      password: 'password123'
    };

    it('should respond with 201 Success response structure', function (done) {
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
        url: userUrl,
        json: true,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: userBody
      },
      function (error, res, body) {
        if (error) {return done(error);}
        res.statusCode.should.equal(201);
        authHeader = res.headers.authorization;
        validator.validate(body, schema).should.be.true;
        done();
      });
    });

    it('should respond with 400 validation error due to duplicate email id', function (done) {
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
        if (error) {return done(error);}

        res.statusCode.should.equal(400);
        validator.validate(body, defaultErrorResponseSchema).should.be.true;
        done();
      });
    });

    it('should respond with 400 validation error due to invalid payload', function (done) {
      request({
        url: userUrl,
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

  });

  describe('get', function () {
    it('should respond with 200 Success response structure...', function (done) {
      /*eslint-disable*/
      const schema = {
        "type": "array",
        "items": {
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
        }
      };

      /*eslint-enable*/
      request({
        url: userUrl,
        json: true,
        qs: {},
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          authorization: authHeader
        }
      },
      function (error, res, body) {
        if (error) {return done(error);}

        res.statusCode.should.equal(200);

        validator.validate(body, schema).should.be.true;
        done();
      });
    });

    it('should respond with 204 No content found', function (done) {
      request({
        url: userUrl,
        json: true,
        qs: {
          first_name: 'somenotexistedname'
        },
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          authorization: authHeader
        }
      },
      function (error, res) {
        if (error) {return done(error);}

        res.statusCode.should.equal(204);
        done();
      });
    });

    it('should respond with 400 validation error', function (done) {
      request({
        url: userUrl,
        json: true,
        qs: {
          first_name: 123
        },
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          authorization: authHeader
        }
      },
      function (error, res, body) {
        if (error) {return done(error);}

        res.statusCode.should.equal(400);

        validator.validate(body, defaultErrorResponseSchema).should.be.true;
        done();
      });
    });

    it('should respond with 401 unauthorized error', function (done) {
      request({
        url: userUrl,
        json: true,
        qs: {},
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          authorization: 'someAuthHeader'
        }
      },
      function (error, res, body) {
        if (error) {return done(error);}

        res.statusCode.should.equal(401);

        validator.validate(body, defaultErrorResponseSchema).should.be.true;
        done();
      });
    });
  });
});