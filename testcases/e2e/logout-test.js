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

describe('/logout', function () {
  const logoutUrl = `${BASE_URL}/api/logout`;
  let authToken;
  before(function (done) {
    UserHelper.createUser({}, (error, response) => {
      if (error) {
        return done(error);
      }
      authToken = response.headers.authorization;
      return done();
    });
  });

  describe('get', function () {
    it('should respond with 200 Successfully logout', function (done) {
      /*eslint-disable*/
      const schema = {
        "type": "object",
        "properties": {
          "message": {
            "type": "string"
          }
        }
      };

      /*eslint-enable*/
      request({
        url: logoutUrl,
        json: true,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          authorization: authToken
        }
      },
      function (error, res, body) {
        if (error) {return done(error);}

        res.statusCode.should.equal(200);

        validator.validate(body, schema).should.be.true;
        done();
      });
    });

    it('should respond with 401 when token not pass', function (done) {
      request({
        url: logoutUrl,
        json: true,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      },
      function (error, res, body) {
        if (error) {return done(error);}

        res.statusCode.should.equal(401);

        validator.validate(body, defaultErrorResponseSchema).should.be.true;
        done();
      });
    });

    it('should respond with 401 when invalid token pass', function (done) {
      request({
        url: logoutUrl,
        json: true,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          authorization: authToken
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