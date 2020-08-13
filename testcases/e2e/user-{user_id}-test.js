'use strict';
const chai = require('chai');
const ZSchema = require('z-schema');
const request = require('request');
const config = require('config');
const asyncLib = require('async');
const {zSchemaCustomFormat, defaultErrorResponseSchema} = require('../../utils/TestUtils');
zSchemaCustomFormat(ZSchema);
const validator = new ZSchema({});
const BASE_URL = `${config.get('BASE_URL')}:${config.get('APP_PORT')}`;
const {UserHelper} = require('./e2eHelper');

chai.should();

describe('/user/{user_id}', function () {
  const records = [];
  let firstRecord;
  const userRoute = `${BASE_URL}/api/user`;
  before(function (done) {
    asyncLib.timesLimit(3, 1, (number, callback) => {
      UserHelper.createUser({}, (error, userData) => {
        if (error) {
          return callback(error);
        }
        if (!firstRecord) {
          firstRecord = userData;
        }
        records.push(userData);
        return callback();
      });
    }, done);
  });
  describe('get', function () {
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
        url: `${userRoute}/${firstRecord.body._id}`,
        json: true,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          authorization: firstRecord.headers.authorization
        }
      },
      function (error, res, body) {
        if (error) {return done(error);}
        res.statusCode.should.equal(200);

        validator.validate(body, schema).should.be.true;
        done();
      });
    });

    it('should respond with 400 validation error when path param does not match', function (done) {
      /*eslint-enable*/
      request({
        url: `${userRoute}/someInvalidId`,
        json: true,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          authorization: firstRecord.headers.authorization
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
      /*eslint-enable*/
      request({
        url: `${userRoute}/${firstRecord.body._id}`,
        json: true,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          authorization: 'someBadToken'
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

  describe('put', function () {
    const body = {
      first_name: 'someNewName'
    };
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
        url: `${userRoute}/${firstRecord.body._id}`,
        json: true,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: firstRecord.headers.authorization
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

    it('should respond with 400 validation error when invalid body param pass', function (done) {
      /*eslint-enable*/
      request({
        url: `${userRoute}/${firstRecord.body._id}`,
        json: true,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: firstRecord.headers.authorization
        },
        body: {
          first_name: 10
        }
      },
      function (error, res, body) {
        if (error) {return done(error);}

        res.statusCode.should.equal(400);

        validator.validate(body, defaultErrorResponseSchema).should.be.true;
        done();
      });
    });

    it('should respond with 400 validation error when try to update set the already existed email', function (done) {
      /*eslint-enable*/
      const body = {
        email: records[1].body.email
      };
      request({
        url: `${userRoute}/${firstRecord.body._id}`,
        json: true,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: firstRecord.headers.authorization
        },
        body: body
      },
      function (error, res, body) {
        if (error) {return done(error);}

        res.statusCode.should.equal(400);

        validator.validate(body, defaultErrorResponseSchema).should.be.true;
        done();
      });
    });

    it('should respond with 401 when invalid auth header pass', function (done) {
      /*eslint-enable*/
      request({
        url: `${userRoute}/${firstRecord.body._id}`,
        json: true,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: 'someBadTokenValue'
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

    it('should respond with 403 permission denied error when non admin user try to access put route for another user',
      function (done) {
        /*eslint-enable*/
        request({
          url: `${userRoute}/${firstRecord.body._id}`,
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

    it('should respond with 412 when required payload not passed', function (done) {
      /*eslint-enable*/
      request({
        url: `${userRoute}/${firstRecord.body._id}`,
        json: true,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: firstRecord.headers.authorization
        },
        body: {}
      },
      function (error, res, body) {
        if (error) {
          return done(error);
        }

        res.statusCode.should.equal(412);

        validator.validate(body, defaultErrorResponseSchema).should.be.true;
        done();
      });
    });
  });

  describe('delete', function () {
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
        url: `${userRoute}/${firstRecord.body._id}`,
        json: true,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          authorization: firstRecord.headers.authorization
        }
      },
      function (error, res, body) {
        if (error) {return done(error);}

        res.statusCode.should.equal(200);

        validator.validate(body, schema).should.be.true;
        done();
      });
    });

    it('should respond with 400 validation error when invalid path param pass', function (done) {
      /*eslint-enable*/
      request({
        url: `${userRoute}/someInvalidId`,
        json: true,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          authorization: firstRecord.headers.authorization
        }
      },
      function (error, res, body) {
        if (error) {return done(error);}

        res.statusCode.should.equal(400);

        validator.validate(body, defaultErrorResponseSchema).should.be.true;
        done();
      });
    });

    it('should respond with 401 unauthorized error occurred', function (done) {
      /*eslint-enable*/
      request({
        url: `${userRoute}/${firstRecord.body._id}`,
        json: true,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          authorization: 'someBadToken'
        }
      },
      function (error, res, body) {
        if (error) {return done(error);}

        res.statusCode.should.equal(401);

        validator.validate(body, defaultErrorResponseSchema).should.be.true;
        done();
      });
    });

    it('should respond with 403 permission denied error occurred while non admin user try to delete another user',
      function (done) {
      /*eslint-enable*/
        request({
          url: `${userRoute}/${records[1].body._id}`,
          json: true,
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            authorization: records[2].headers.authorization
          }
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