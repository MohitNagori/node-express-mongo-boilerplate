'use strict';
const chai = require('chai');
const ZSchema = require('z-schema');
const request = require('request');
const config = require('config');
const {zSchemaCustomFormat} = require('../../utils/TestUtils');
zSchemaCustomFormat(ZSchema);
const validator = new ZSchema({});
const BASE_URL = `${config.get('BASE_URL')}:${config.get('APP_PORT')}`;
chai.should();

describe('/status', function () {
  describe('get', function () {
    it('should respond with 200 Success response structure', function (done) {
      /*eslint-disable*/
      const schema = {
        "type": "object",
        "properties": {
          "message": {
            "type": "string"
          },
          "responseAt": {
            "type": "string",
            "format": "date-time"
          }
        },
        "required": [
          "message",
          "responseAt"
        ]
      };

      /*eslint-enable*/
      request({
        url: `${BASE_URL}/api/status`,
        json: true,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      },
      function (error, res, body) {
        if (error) {return done(error);}

        res.statusCode.should.equal(200);

        validator.validate(body, schema).should.be.true;
        done();
      });
    });
  });
});