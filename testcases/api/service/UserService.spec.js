'use strict';
const moment = require('moment');
const _ = require('lodash');
const config = require('config');
const {assert} = require('chai');
const sinon = require('sinon');
const ObjectId = require('mongoose').Types.ObjectId;
const {UserService} = require('../../../api/services');
const {logger} = require('../../../utils/TestUtils');
const {DbOperationHelper, dbSchemas} = require('../../../database');
const {jwtHelper} = require('../../../helpers');
const {UserSchema} = dbSchemas;
const {redisClient} = require('../../../index');

/**
 * @TestSuite UserService
 * @description - Test the UserService class
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
describe('UserService Class:- Test Scenarios', () => {
  let loggerSpy = null;
  beforeEach(() => {
    loggerSpy = sinon.spy();
  });
  afterEach(() => {
    sinon.restore();
  });
  let userId = new ObjectId();
  const email = 'user@example.com';
  const userData = new UserSchema({
    '_id': userId,
    'user_role': 'User',
    'first_name': 'String',
    'last_name': 'String',
    'email': email,
    'dob': new Date(),
    'createdAt': '2019-07-21T00:37:33.328+05:30',
    'updatedAt': '2019-07-21T00:37:33.328+05:30',
    '__v': 0
  });

  /**
   * @TestSuite createUser()
   * @description - Test the create user functionality of UserService
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('createUser() Method:- Test Scenarios', () => {
    let swaggerParams = {
      registration_body: {
        value: {
          first_name: 'string',
          last_name: 'string',
          email: userData.email,
          password: 'somePassWord'
        }
      }
    };

    it('Test the validation error of duplicate email address while store the user record in db', (done) => {
      const dbError = {
        code: 11000
      };
      let userData = new UserSchema({
        '_id': userId,
        'user_role': 'User',
        'first_name': 'String',
        'last_name': 'String',
        'email': 'user@example.com',
        'dob': new Date(),
        'createdAt': '2019-07-21T00:37:33.328+05:30',
        'updatedAt': '2019-07-21T00:37:33.328+05:30',
        '__v': 0
      });

      sinon.stub(DbOperationHelper.prototype, 'save')
        .callsFake((_userRecord,  isForUpdate, callback) => {
          _userRecord = _.pick(_userRecord, ['first_name', 'last_name', 'email']);
          userData = _.pick(userData, ['first_name', 'last_name', 'email']);
          assert.deepEqual(
            _userRecord,
            userData,
            'Expected user record does not match for save in db'
          );
          assert.isFalse(isForUpdate, 'Is For Update flag have to be false for new record');
          return callback(dbError);
        });

      const expectedResponseError = {
        code: 'EMAIL_ADDRESS_DUPLICATION',
        message: 'An email address is already exist in a system, Please try another email address',
        errors: [{
          'message': 'An email address is already register for some other user',
          'path': ['registration_body', 'email']
        }],
        statusCode: 400
      };
      const res = {};
      const nextSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger should be called at least once');
        assert.deepEqual(
          resError,
          expectedResponseError,
          'Expected response error does not match'
        );
        done();
      });
      const service = new UserService(logger(loggerSpy));
      service.createUser(swaggerParams, res, nextSpy);
    });

    it('Test the runtime error while store the user record in db', (done) => {
      const dbError = {
        error: 'someDbError'
      };
      let userData = new UserSchema({
        '_id': userId,
        'user_role': 'User',
        'first_name': 'String',
        'last_name': 'String',
        'email': 'user@example.com',
        'dob': new Date(),
        'createdAt': '2019-07-21T00:37:33.328+05:30',
        'updatedAt': '2019-07-21T00:37:33.328+05:30',
        '__v': 0
      });

      sinon.stub(DbOperationHelper.prototype, 'save')
        .callsFake((_userRecord,  isForUpdate, callback) => {
          _userRecord = _.pick(_userRecord, ['first_name', 'last_name', 'email']);
          userData = _.pick(userData, ['first_name', 'last_name', 'email']);
          assert.deepEqual(
            _userRecord,
            userData,
            'Expected user record does not match for save in db'
          );
          assert.isFalse(isForUpdate, 'Is For Update flag have to be false for new record');
          return callback(dbError);
        });

      const expectedResponseError = {
        message: `An error occurred during registering user with email address [${email}]`,
        statusCode: 500
      };
      const res = {};
      const nextSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger should be called at least once');
        assert.deepEqual(
          resError,
          expectedResponseError,
          'Expected response error does not match'
        );
        done();
      });
      const service = new UserService(logger(loggerSpy));
      service.createUser(swaggerParams, res, nextSpy);
    });

    it('Test the runtime error while generating JWT for auth header', (done) => {
      const jwtError = {
        error: 'someError'
      };
      let userData = new UserSchema({
        '_id': userId,
        'user_role': 'User',
        'first_name': 'String',
        'last_name': 'String',
        'email': 'user@example.com',
        'dob': new Date(),
        'createdAt': '2019-07-21T00:37:33.328+05:30',
        'updatedAt': '2019-07-21T00:37:33.328+05:30',
        '__v': 0
      });

      sinon.stub(DbOperationHelper.prototype, 'save')
        .callsFake((_userRecord,  isForUpdate, callback) => {
          _userRecord = _.pick(_userRecord, ['first_name', 'last_name', 'email']);
          let _userData = _.pick(userData, ['first_name', 'last_name', 'email']);
          assert.deepEqual(
            _userRecord,
            _userData,
            'Expected user record does not match for save in db'
          );
          assert.isFalse(isForUpdate, 'Is For Update flag have to be false for new record');
          return callback(null, userData);
        });

      sinon.stub(jwtHelper, 'sign')
        .callsFake((_userResponse, logger, redisClient, callback) => {
          assert.deepEqual(
            _userResponse,
            userData.getUserDetail(),
            'Expected user response does not match'
          );
          return callback(jwtError);
        });
      const expectedResponseError = {
        message: `An error occurred during generating the jwt token for email address [${email}]`,
        statusCode: 500
      };
      const res = {};
      const nextSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger should be called at least once');
        assert.deepEqual(
          resError,
          expectedResponseError,
          'Expected response error does not match'
        );
        done();
      });
      const service = new UserService(logger(loggerSpy));
      service.createUser(swaggerParams, res, nextSpy);
    });

    it('Test the success scenario to create user', (done) => {
      const jwtToken = 'someToken';
      let userData = new UserSchema({
        '_id': userId,
        'user_role': 'User',
        'first_name': 'String',
        'last_name': 'String',
        'email': 'user@example.com',
        'dob': new Date(),
        'createdAt': '2019-07-21T00:37:33.328+05:30',
        'updatedAt': '2019-07-21T00:37:33.328+05:30',
        '__v': 0
      });

      sinon.stub(DbOperationHelper.prototype, 'save')
        .callsFake((_userRecord,  isForUpdate, callback) => {
          _userRecord = _.pick(_userRecord, ['first_name', 'last_name', 'email']);
          let _userData = _.pick(userData, ['first_name', 'last_name', 'email']);
          assert.deepEqual(
            _userRecord,
            _userData,
            'Expected user record does not match for save in db'
          );
          assert.isFalse(isForUpdate, 'Is For Update flag have to be false for new record');
          return callback(null, userData);
        });

      sinon.stub(jwtHelper, 'sign')
        .callsFake((_userResponse, logger, redisClient, callback) => {
          assert.deepEqual(
            _userResponse,
            userData.getUserDetail(),
            'Expected user response does not match'
          );
          return callback(null, jwtToken);
        });
      const headerSpy = sinon.spy((key, value) => {
        const header = {};
        header[key] = value;
        const _expectedHeader = {
          authorization: jwtToken
        };
        assert.deepEqual(
          header,
          _expectedHeader,
          'Expected auth header does not match'
        );
      });
      const statusSpy = sinon.spy((statusCode) => {
        assert.equal(statusCode, 201, 'Expected status code in response does not match');
        return res;
      });
      const jsonSpy = sinon.spy((_userResponse) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger should be called at least once');
        assert.equal(nextSpy.callCount, 0, 'Expected next not to be called in success response');
        assert.deepEqual(
          _userResponse,
          userData.getUserDetail(),
          'Expected user response does not match'
        );
        done();
      });
      const res = {
        setHeader: headerSpy,
        status: statusSpy,
        json: jsonSpy
      };
      const nextSpy = sinon.spy();
      const service = new UserService(logger(loggerSpy));
      service.createUser(swaggerParams, res, nextSpy);
    });
  });

  /**
   * @TestSuite getUserList()
   * @description - Test the get user list functionality of UserService
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('getUserList() Method:- Test Scenarios', () => {
    const route = `${config.get('BASE_URL')}:${config.get('APP_PORT')}/api/user`;
    const firstName = 'string';
    const lastName = 'string';
    let request = {
      url: '/api/user?first_name=string&last_name=string&page=1&itemsPerPage=25&sortBy=first_name,-last_name',
      swagger: {
        params: {
          first_name: {
            value: firstName,
            schema: {
              in: 'query',
              name: 'first_name'
            }
          },
          last_name: {
            value: lastName,
            schema: {
              in: 'query',
              name: 'last_name'
            }
          },
          sortBy: {
            value: ['first_name', '-last_name'],
            schema: {
              name: 'sortBy',
              in: 'query'
            }
          },
          page: {
            value: 1,
            schema: {
              name: 'page',
              in: 'query'
            }
          },
          itemsPerPage: {
            value: 25,
            schema: {
              name: 'itemsPerPage',
              in: 'query'
            }
          }
        }
      }
    };
    const expectedCountQuery = {
      first_name: _.upperFirst(firstName),
      last_name: _.upperFirst(lastName)
    };

    it('Test the runtime error while counting user records', (done) => {
      const dbError = {
        error: 'someError'
      };
      const expectedResponseError = {
        message: 'An error occurred while retrieving registered users list',
        statusCode: 500
      };

      sinon.stub(DbOperationHelper.prototype, 'count')
        .callsFake((schema, _query, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected user schema does not match'
          );
          assert.deepEqual(
            _query,
            expectedCountQuery,
            'Expected count query object does not match'
          );
          return callback(dbError);
        });

      sinon.stub(DbOperationHelper.prototype, 'pagination').callsFake();

      const res = {};
      const nextSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger should expected to be called at least once');
        assert.deepEqual(
          resError,
          expectedResponseError,
          'Expected response error does not match'
        );
        done();
      });
      const service = new UserService(logger(loggerSpy));
      service.getUserList(request, res, nextSpy);
    });

    it('Test the runtime error while retrieving user records', (done) => {
      const dbError = {
        error: 'someError'
      };
      const expectedResponseError = {
        message: 'An error occurred while retrieving registered users list',
        statusCode: 500
      };

      sinon.stub(DbOperationHelper.prototype, 'count')
        .callsFake((schema, _query, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected user schema does not match'
          );
          assert.deepEqual(
            _query,
            expectedCountQuery,
            'Expected count query object does not match'
          );
          return callback();
        });

      const paginationOption = {
        sortingObj: {
          first_name: 1,
          last_name: -1
        },
        page: 1,
        itemsPerPage: 25
      };
      const expectedPaginationOptions = {
        query: expectedCountQuery,
        queryOptions: {},
        paginationOption: paginationOption
      };
      sinon.stub(DbOperationHelper.prototype, 'pagination')
        .callsFake((schema, _paginationOptions, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected user schema does not match'
          );
          assert.deepEqual(
            _paginationOptions,
            expectedPaginationOptions,
            'Expected pagination options does not match'
          );
          return callback(dbError);
        });
      const res = {};
      const nextSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger should expected to be called at least once');
        assert.deepEqual(
          resError,
          expectedResponseError,
          'Expected response error does not match'
        );
        done();
      });
      const service = new UserService(logger(loggerSpy));
      service.getUserList(request, res, nextSpy);
    });

    it('Test the no content scenarios while retrieving user records', (done) => {
      sinon.stub(DbOperationHelper.prototype, 'count')
        .callsFake((schema, _query, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected user schema does not match'
          );
          assert.deepEqual(
            _query,
            expectedCountQuery,
            'Expected count query object does not match'
          );
          return callback(null, 0);
        });

      const paginationOption = {
        sortingObj: {
          first_name: 1,
          last_name: -1
        },
        page: 1,
        itemsPerPage: 25
      };
      const expectedPaginationOptions = {
        query: expectedCountQuery,
        queryOptions: {},
        paginationOption: paginationOption
      };
      sinon.stub(DbOperationHelper.prototype, 'pagination')
        .callsFake((schema, _paginationOptions, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected user schema does not match'
          );
          assert.deepEqual(
            _paginationOptions,
            expectedPaginationOptions,
            'Expected pagination options does not match'
          );
          return callback(null, []);
        });
      const expectedHeader = {
        'x-items-count': 0,
        'x-page-links': JSON.stringify({
          'first': `${route}?first_name=string&last_name=string&page=1&itemsPerPage=25&sortBy=first_name,-last_name`,
          'last': `${route}?first_name=string&last_name=string&page=1&itemsPerPage=25&sortBy=first_name,-last_name`
        })
      };
      const _actualHeader = {};
      const setHeaderSpy = sinon.spy((key, value) => {
        _actualHeader[key] = value;
      });
      const statusSpy = sinon.spy((_statusCode) => {
        assert.equal(_statusCode, 204, 'Expected status code in response does not match');
        return res;
      });
      const endSpy = sinon.stub(() => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger should expected to be called at least once');
        assert.equal(nextSpy.callCount, 0, 'Expected next not to be called in no content scenario');
        assert.deepEqual(
          _actualHeader,
          expectedHeader,
          'Expected header in response does not match'
        );
        done();
      });
      const res = {
        setHeader: setHeaderSpy,
        status: statusSpy,
        end: endSpy
      };
      const nextSpy = sinon.spy();
      const service = new UserService(logger(loggerSpy));
      service.getUserList(request, res, nextSpy);
    });

    it('Test the success scenarios while retrieving user records from page 1 and last page is 2', (done) => {
      sinon.stub(DbOperationHelper.prototype, 'count')
        .callsFake((schema, _query, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected user schema does not match'
          );
          assert.deepEqual(
            _query,
            expectedCountQuery,
            'Expected count query object does not match'
          );
          return callback(null, 30);
        });

      const paginationOption = {
        sortingObj: {
          first_name: 1,
          last_name: -1
        },
        page: 1,
        itemsPerPage: 25
      };
      const expectedPaginationOptions = {
        query: expectedCountQuery,
        queryOptions: {},
        paginationOption: paginationOption
      };
      sinon.stub(DbOperationHelper.prototype, 'pagination')
        .callsFake((schema, _paginationOptions, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected user schema does not match'
          );
          assert.deepEqual(
            _paginationOptions,
            expectedPaginationOptions,
            'Expected pagination options does not match'
          );
          return callback(null, _.fill(Array(1), userData.toObject()));
        });
      const expectedHeader = {
        'x-items-count': 30,
        'x-page-links': JSON.stringify({
          'first': `${route}?first_name=string&last_name=string&page=1&itemsPerPage=25&sortBy=first_name,-last_name`,
          'last': `${route}?first_name=string&last_name=string&page=2&itemsPerPage=25&sortBy=first_name,-last_name`,
          'next': `${route}?first_name=string&last_name=string&page=2&itemsPerPage=25&sortBy=first_name,-last_name`
        })
      };
      const _actualHeader = {};
      const setHeaderSpy = sinon.spy((key, value) => {
        _actualHeader[key] = value;
      });
      const statusSpy = sinon.spy((_statusCode) => {
        assert.equal(_statusCode, 200, 'Expected status code in response does not match');
        return res;
      });
      const jsonSpy = sinon.stub((response) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger should expected to be called at least once');
        assert.equal(nextSpy.callCount, 0, 'Expected next not to be called in no content scenario');
        assert.deepEqual(
          _actualHeader,
          expectedHeader,
          'Expected header in response does not match'
        );
        const _userData = _.cloneDeep(userData.toObject());
        _userData['dob'] = moment(_userData['dob']).format('YYYY-MM-DD');
        assert.deepEqual(
          response[0],
          _userData,
          'Expected response does not match'
        );
        done();
      });
      const res = {
        setHeader: setHeaderSpy,
        status: statusSpy,
        json: jsonSpy
      };
      const nextSpy = sinon.spy();
      const service = new UserService(logger(loggerSpy));
      service.getUserList(request, res, nextSpy);
    });

    it('Test the success scenarios while retrieving user records from page 2 and last page is 4', (done) => {
      let request = {
        url: '/api/user?first_name=string&last_name=string&page=2&itemsPerPage=25&sortBy=first_name,-last_name',
        swagger: {
          params: {
            first_name: {
              value: firstName,
              schema: {
                in: 'query',
                name: 'first_name'
              }
            },
            last_name: {
              value: lastName,
              schema: {
                in: 'query',
                name: 'last_name'
              }
            },
            sortBy: {
              value: ['first_name', '-last_name'],
              schema: {
                name: 'sortBy',
                in: 'query'
              }
            },
            page: {
              value: 2,
              schema: {
                name: 'page',
                in: 'query'
              }
            },
            itemsPerPage: {
              value: 25,
              schema: {
                name: 'itemsPerPage',
                in: 'query'
              }
            }
          }
        }
      };
      sinon.stub(DbOperationHelper.prototype, 'count')
        .callsFake((schema, _query, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected user schema does not match'
          );
          assert.deepEqual(
            _query,
            expectedCountQuery,
            'Expected count query object does not match'
          );
          return callback(null, 100);
        });

      const paginationOption = {
        sortingObj: {
          first_name: 1,
          last_name: -1
        },
        page: 2,
        itemsPerPage: 25
      };
      const expectedPaginationOptions = {
        query: expectedCountQuery,
        queryOptions: {},
        paginationOption: paginationOption
      };
      sinon.stub(DbOperationHelper.prototype, 'pagination')
        .callsFake((schema, _paginationOptions, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected user schema does not match'
          );
          assert.deepEqual(
            _paginationOptions,
            expectedPaginationOptions,
            'Expected pagination options does not match'
          );
          return callback(null, _.fill(Array(1), userData.toObject()));
        });

      const expectedHeader = {
        'x-items-count': 100,
        'x-page-links': JSON.stringify({
          'first': `${route}?first_name=string&last_name=string&page=1&itemsPerPage=25&sortBy=first_name,-last_name`,
          'last': `${route}?first_name=string&last_name=string&page=4&itemsPerPage=25&sortBy=first_name,-last_name`,
          'next': `${route}?first_name=string&last_name=string&page=3&itemsPerPage=25&sortBy=first_name,-last_name`,
          'prev': `${route}?first_name=string&last_name=string&page=1&itemsPerPage=25&sortBy=first_name,-last_name`
        })
      };
      const _actualHeader = {};
      const setHeaderSpy = sinon.spy((key, value) => {
        _actualHeader[key] = value;
      });
      const statusSpy = sinon.spy((_statusCode) => {
        assert.equal(_statusCode, 200, 'Expected status code in response does not match');
        return res;
      });
      const jsonSpy = sinon.stub((response) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger should expected to be called at least once');
        assert.equal(nextSpy.callCount, 0, 'Expected next not to be called in no content scenario');
        assert.deepEqual(
          _actualHeader,
          expectedHeader,
          'Expected header in response does not match'
        );
        const _userData = _.cloneDeep(userData.toObject());
        _userData['dob'] = moment(_userData['dob']).format('YYYY-MM-DD');
        assert.deepEqual(
          response[0],
          _userData,
          'Expected response does not match'
        );
        done();
      });
      const res = {
        setHeader: setHeaderSpy,
        status: statusSpy,
        json: jsonSpy
      };
      const nextSpy = sinon.spy();
      const service = new UserService(logger(loggerSpy));
      service.getUserList(request, res, nextSpy);
    });

    it('Test the success scenarios while retrieving user records from last page', (done) => {
      let request = {
        url: '/api/user?first_name=string&last_name=string&page=4&itemsPerPage=25&sortBy=first_name,-last_name',
        swagger: {
          params: {
            first_name: {
              value: firstName,
              schema: {
                in: 'query',
                name: 'first_name'
              }
            },
            last_name: {
              value: lastName,
              schema: {
                in: 'query',
                name: 'last_name'
              }
            },
            sortBy: {
              value: ['first_name', '-last_name'],
              schema: {
                name: 'sortBy',
                in: 'query'
              }
            },
            page: {
              value: 4,
              schema: {
                name: 'page',
                in: 'query'
              }
            },
            itemsPerPage: {
              value: 25,
              schema: {
                name: 'itemsPerPage',
                in: 'query'
              }
            }
          }
        }
      };
      sinon.stub(DbOperationHelper.prototype, 'count')
        .callsFake((schema, _query, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected user schema does not match'
          );
          assert.deepEqual(
            _query,
            expectedCountQuery,
            'Expected count query object does not match'
          );
          return callback(null, 100);
        });

      const paginationOption = {
        sortingObj: {
          first_name: 1,
          last_name: -1
        },
        page: 4,
        itemsPerPage: 25
      };
      const expectedPaginationOptions = {
        query: expectedCountQuery,
        queryOptions: {},
        paginationOption: paginationOption
      };
      sinon.stub(DbOperationHelper.prototype, 'pagination')
        .callsFake((schema, _paginationOptions, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected user schema does not match'
          );
          assert.deepEqual(
            _paginationOptions,
            expectedPaginationOptions,
            'Expected pagination options does not match'
          );
          return callback(null, _.fill(Array(1), userData.toObject()));
        });

      const expectedHeader = {
        'x-items-count': 100,
        'x-page-links': JSON.stringify({
          'first': `${route}?first_name=string&last_name=string&page=1&itemsPerPage=25&sortBy=first_name,-last_name`,
          'last': `${route}?first_name=string&last_name=string&page=4&itemsPerPage=25&sortBy=first_name,-last_name`,
          'prev': `${route}?first_name=string&last_name=string&page=3&itemsPerPage=25&sortBy=first_name,-last_name`
        })
      };
      const _actualHeader = {};
      const setHeaderSpy = sinon.spy((key, value) => {
        _actualHeader[key] = value;
      });
      const statusSpy = sinon.spy((_statusCode) => {
        assert.equal(_statusCode, 200, 'Expected status code in response does not match');
        return res;
      });
      const jsonSpy = sinon.stub((response) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger should expected to be called at least once');
        assert.equal(nextSpy.callCount, 0, 'Expected next not to be called in no content scenario');
        assert.deepEqual(
          _actualHeader,
          expectedHeader,
          'Expected header in response does not match'
        );
        const _userData = _.cloneDeep(userData.toObject());
        _userData['dob'] = moment(_userData['dob']).format('YYYY-MM-DD');
        assert.deepEqual(
          response[0],
          _userData,
          'Expected response does not match'
        );
        done();
      });
      const res = {
        setHeader: setHeaderSpy,
        status: statusSpy,
        json: jsonSpy
      };
      const nextSpy = sinon.spy();
      const service = new UserService(logger(loggerSpy));
      service.getUserList(request, res, nextSpy);
    });
  });

  /**
   * @TestSuite getUserById()
   * @description - Test the get user by id functionality of UserService
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('getUserById() Method:- Test Scenarios', () => {
    let swaggerParams = {
      user_id: {
        value: userId
      }
    };
    const findByIdOptions = {
      query: userId,
      queryOptions: {},
      isLean: true
    };

    it('Test the runtime error occurred while retrieving user record by id', (done) => {
      const dbError = {
        error: 'someDbError'
      };
      const expectedResponseError = {
        message: `An error occurred while retrieving the user detail for user id [${userId}]`,
        statusCode: 500
      };

      sinon.stub(DbOperationHelper.prototype, 'findById')
        .callsFake((schema, _queryOptions, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected User schema does not match'
          );
          assert.deepEqual(
            _queryOptions,
            findByIdOptions,
            'Expected query options does not match'
          );
          return callback(dbError);
        });
      const res = {};
      const nextSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger should expected to be called once');
        assert.deepEqual(
          resError,
          expectedResponseError,
          'Expected response error does not match'
        );
        done();
      });
      const service = new UserService(logger(loggerSpy));
      service.getUserById(swaggerParams, res, nextSpy);
    });

    it('Test the resource not found error occurred while retrieving user record by id', (done) => {
      const expectedResponseError = {
        code: 'NOT_FOUND',
        message: `No record found for user with user id [${userId}]`,
        statusCode: 404
      };

      sinon.stub(DbOperationHelper.prototype, 'findById')
        .callsFake((schema, _queryOptions, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected User schema does not match'
          );
          assert.deepEqual(
            _queryOptions,
            findByIdOptions,
            'Expected query options does not match'
          );
          return callback();
        });
      const res = {};
      const nextSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger should expected to be called once');
        assert.deepEqual(
          resError,
          expectedResponseError,
          'Expected response error does not match'
        );
        done();
      });
      const service = new UserService(logger(loggerSpy));
      service.getUserById(swaggerParams, res, nextSpy);
    });

    it('Test the success scenarios of retrieving user record by id', (done) => {
      sinon.stub(DbOperationHelper.prototype, 'findById')
        .callsFake((schema, _queryOptions, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected User schema does not match'
          );
          assert.deepEqual(
            _queryOptions,
            findByIdOptions,
            'Expected query options does not match'
          );
          return callback(null, userData);
        });

      const statusSpy = sinon.spy((_statusCode) => {
        assert.equal(_statusCode, 200, 'Expected response code does not match');
        return res;
      });
      const jsonSpy = sinon.spy((response) => {
        assert.equal(nextSpy.callCount, 0, 'Expected next not to be called');
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger should expected to be called once');
        assert.deepEqual(
          response.toObject(),
          userData.toObject(),
          'Expected user record in response does not match'
        );
        done();
      });
      const res = {
        status: statusSpy,
        json: jsonSpy
      };
      const nextSpy = sinon.spy();
      const service = new UserService(logger(loggerSpy));
      service.getUserById(swaggerParams, res, nextSpy);
    });
  });

  /**
   * @TestSuite deleteUserById()
   * @description - Test the delete user by id functionality of UserService
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('deleteUserById() Method:- Test Scenarios', () => {
    let swaggerParams = {
      user_id: {
        value: userId
      }
    };
    let request = {
      swagger: {
        params: swaggerParams
      },
      headers: {
        authorization: 'someAuthToken'
      }
    };
    const findAndRemoveQueryOptions = {
      _id: userId
    };

    it('Test the runtime error while finding and removing the user from system', (done) => {
      const dbError = {
        error: 'someError'
      };
      const expectedResponseError = {
        message: `An error occurred while deleting the user detail for user id [${userId}]`,
        statusCode: 500
      };
      const res = {};
      const nextSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger expected to be called once');
        assert.deepEqual(
          resError,
          expectedResponseError,
          'Expected response error does not match'
        );
        done();
      });

      sinon.stub(DbOperationHelper.prototype, 'findOneAndRemove')
        .callsFake((schema, queryOptions, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected user schema does not match'
          );
          assert.deepEqual(
            queryOptions,
            findAndRemoveQueryOptions,
            'Expected query options does not match'
          );
          return callback(dbError);
        });
      const service = new UserService(logger(loggerSpy));
      service.deleteUserById(request, res, nextSpy);
    });

    it('Test the resource not found error while finding and removing the user from system', (done) => {
      const expectedResponseError = {
        code: 'NOT_FOUND',
        message: `No record found for user with user id [${userId}]`,
        statusCode: 404
      };
      const res = {};
      const nextSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger expected to be called once');
        assert.deepEqual(
          resError,
          expectedResponseError,
          'Expected response error does not match'
        );
        done();
      });

      sinon.stub(DbOperationHelper.prototype, 'findOneAndRemove')
        .callsFake((schema, queryOptions, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected user schema does not match'
          );
          assert.deepEqual(
            queryOptions,
            findAndRemoveQueryOptions,
            'Expected query options does not match'
          );
          return callback();
        });
      const service = new UserService(logger(loggerSpy));
      service.deleteUserById(request, res, nextSpy);
    });

    it('Test the runtime error removing the auth token for deleted user', (done) => {
      const jwtError = {
        error: 'someJWTError'
      };
      const statusSpy = sinon.spy((_statusCode) => {
        assert.equal(_statusCode, 200, 'Expected status code in response does not matched');
        return res;
      });
      const jsonSpy = sinon.spy((response) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger expected to be called once');
        assert.equal(nextSpy.callCount, 0, 'Expected next not to be called in success scenario');
        assert.deepEqual(
          response,
          userData.getUserDetail(),
          'Expected response does not match'
        );
        done();
      });
      const res = {
        status: statusSpy,
        json: jsonSpy
      };
      const nextSpy = sinon.spy();

      sinon.stub(DbOperationHelper.prototype, 'findOneAndRemove')
        .callsFake((schema, queryOptions, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected user schema does not match'
          );
          assert.deepEqual(
            queryOptions,
            findAndRemoveQueryOptions,
            'Expected query options does not match'
          );
          return callback(null, userData);
        });

      sinon.stub(redisClient, 'del').callsFake((authKey, callback) => {
        assert.equal(
          authKey,
          request.headers.authorization,
          'Expected jwt token does not match'
        );
        return callback(jwtError);
      });

      const service = new UserService(logger(loggerSpy));
      service.deleteUserById(request, res, nextSpy);
    });

    it('Test the success scenario for delete user', (done) => {
      const statusSpy = sinon.spy((_statusCode) => {
        assert.equal(_statusCode, 200, 'Expected status code in response does not matched');
        return res;
      });
      const jsonSpy = sinon.spy((response) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger expected to be called once');
        assert.equal(nextSpy.callCount, 0, 'Expected next not to be called in success scenario');
        assert.deepEqual(
          response,
          userData.getUserDetail(),
          'Expected response does not match'
        );
        done();
      });
      const res = {
        status: statusSpy,
        json: jsonSpy
      };
      const nextSpy = sinon.spy();

      sinon.stub(DbOperationHelper.prototype, 'findOneAndRemove')
        .callsFake((schema, queryOptions, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected user schema does not match'
          );
          assert.deepEqual(
            queryOptions,
            findAndRemoveQueryOptions,
            'Expected query options does not match'
          );
          return callback(null, userData);
        });

      sinon.stub(redisClient, 'del').callsFake((authKey, callback) => {
        assert.equal(
          authKey,
          request.headers.authorization,
          'Expected jwt token does not match'
        );
        return callback();
      });

      const service = new UserService(logger(loggerSpy));
      service.deleteUserById(request, res, nextSpy);
    });
  });

  /**
   * @TestSuite updateUserById()
   * @description - Test the update user by id functionality of UserService
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('updateUserById() Method:- Test Scenarios', () => {
    let swaggerParams = {
      user_id: {
        value: userId
      },
      update_body: {
        value: {
          first_name: 'someFirstName'
        }
      }
    };
    const findByIdOptions = {
      query: userId,
      queryOptions: {},
      isLean: false
    };

    it('Test the precondition failed error while payload is empty in user update request', (done) => {
      let swaggerParams = {
        user_id: {
          value: userId
        },
        update_body: {
          value: {}
        }
      };
      const expectedResponseError = {
        code: 'PRECONDITION_FAILED',
        message: 'At least one property to be set for user update',
        errors: [{
          message: 'User request payload have to be set at least one property to update',
          path: ['update_body']
        }],
        statusCode: 412
      };
      const res = {};
      const nextSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger should expected to be called once');
        assert.deepEqual(
          resError,
          expectedResponseError,
          'Expected response error does not match'
        );
        done();
      });
      const service = new UserService(logger(loggerSpy));
      service.updateUserById(swaggerParams, res, nextSpy);
    });

    it('Test the runtime error while retrieving user detail for update', (done) => {
      const dbError = {
        error: 'someError'
      };
      const expectedResponseError = {
        message: `An error occurred while retrieving the user detail for user id [${userId}] to update`,
        statusCode: 500
      };

      sinon.stub(DbOperationHelper.prototype, 'findById')
        .callsFake((schema, queryOptions, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected user schema does not match'
          );
          assert.deepEqual(
            queryOptions,
            findByIdOptions,
            'Expected query options does not match'
          );
          return callback(dbError);
        });

      const res = {};
      const nextSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger should expected to be called once');
        assert.deepEqual(
          resError,
          expectedResponseError,
          'Expected response error does not match'
        );
        done();
      });
      const service = new UserService(logger(loggerSpy));
      service.updateUserById(swaggerParams, res, nextSpy);
    });

    it('Test the resource not found error while retrieving user detail for update', (done) => {
      const expectedResponseError = {
        code: 'NOT_FOUND',
        message: `No record found for user with user id [${userId}]`,
        statusCode: 404
      };

      sinon.stub(DbOperationHelper.prototype, 'findById')
        .callsFake((schema, queryOptions, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected user schema does not match'
          );
          assert.deepEqual(
            queryOptions,
            findByIdOptions,
            'Expected query options does not match'
          );
          return callback();
        });

      const res = {};
      const nextSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger should expected to be called once');
        assert.deepEqual(
          resError,
          expectedResponseError,
          'Expected response error does not match'
        );
        done();
      });
      const service = new UserService(logger(loggerSpy));
      service.updateUserById(swaggerParams, res, nextSpy);
    });

    it('Test the validation error while updating user details with duplicate email', (done) => {
      const dbError = {
        code: 11000
      };
      const expectedResponseError = {
        code: 'EMAIL_ADDRESS_DUPLICATION',
        message: 'An email address is already exist in a system, Please try another email address',
        errors: [{
          'message': 'An email address is already register for some other user',
          'path': ['registration_body', 'email']
        }],
        statusCode: 400
      };

      sinon.stub(DbOperationHelper.prototype, 'findById')
        .callsFake((schema, queryOptions, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected user schema does not match'
          );
          assert.deepEqual(
            queryOptions,
            findByIdOptions,
            'Expected query options does not match'
          );
          return callback(null, userData);
        });

      sinon.stub(DbOperationHelper.prototype, 'save')
        .callsFake((_userRecord, isForUpdate, callback) => {
          assert.deepEqual(
            _userRecord,
            userData,
            'Expected user schema does not match'
          );
          assert.isTrue(
            isForUpdate,
            'Expected is for update flag have to be true while updating user'
          );
          return callback(dbError);
        });

      const res = {};
      const nextSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger should expected to be called once');
        assert.deepEqual(
          resError,
          expectedResponseError,
          'Expected response error does not match'
        );
        done();
      });
      const service = new UserService(logger(loggerSpy));
      service.updateUserById(swaggerParams, res, nextSpy);
    });

    it('Test the runtime error occurred while updating user details', (done) => {
      const dbError = {
        error: 'someDbError'
      };
      const expectedResponseError = {
        message: `An error occurred while updating record for user [${userId}]`,
        statusCode: 500
      };

      sinon.stub(DbOperationHelper.prototype, 'findById')
        .callsFake((schema, queryOptions, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected user schema does not match'
          );
          assert.deepEqual(
            queryOptions,
            findByIdOptions,
            'Expected query options does not match'
          );
          return callback(null, userData);
        });

      sinon.stub(DbOperationHelper.prototype, 'save')
        .callsFake((_userRecord, isForUpdate, callback) => {
          assert.deepEqual(
            _userRecord,
            userData,
            'Expected user schema does not match'
          );
          assert.isTrue(
            isForUpdate,
            'Expected is for update flag have to be true while updating user'
          );
          return callback(dbError);
        });

      const res = {};
      const nextSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger should expected to be called once');
        assert.deepEqual(
          resError,
          expectedResponseError,
          'Expected response error does not match'
        );
        done();
      });
      const service = new UserService(logger(loggerSpy));
      service.updateUserById(swaggerParams, res, nextSpy);
    });

    it('Test the success scenario to update user details', (done) => {
      sinon.stub(DbOperationHelper.prototype, 'findById')
        .callsFake((schema, queryOptions, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected user schema does not match'
          );
          assert.deepEqual(
            queryOptions,
            findByIdOptions,
            'Expected query options does not match'
          );
          return callback(null, userData);
        });

      sinon.stub(DbOperationHelper.prototype, 'save')
        .callsFake((_userRecord, isForUpdate, callback) => {
          assert.deepEqual(
            _userRecord,
            userData,
            'Expected user schema does not match'
          );
          assert.isTrue(
            isForUpdate,
            'Expected is for update flag have to be true while updating user'
          );
          return callback(null, userData);
        });

      const statusSpy = sinon.spy((_statusCode) => {
        assert.equal(_statusCode, 200, 'Expected status code in response does not match');
        return res;
      });
      const jsonSpy = sinon.spy((response) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger should expected to be called once');
        assert.equal(nextSpy.callCount, 0, 'Expected next not to be called in success');
        assert.deepEqual(
          response,
          userData.getUserDetail(),
          'Expected user response does not match'
        );
        done();
      });
      const res = {
        status: statusSpy,
        json: jsonSpy
      };
      const nextSpy = sinon.spy();
      const service = new UserService(logger(loggerSpy));
      service.updateUserById(swaggerParams, res, nextSpy);
    });

    it('Test the success scenario to update user details dob', (done) => {
      let swaggerParams = {
        user_id: {
          value: userId
        },
        update_body: {
          value: {
            dob: '2017-07-10'
          }
        }
      };
      sinon.stub(DbOperationHelper.prototype, 'findById')
        .callsFake((schema, queryOptions, callback) => {
          assert.deepEqual(
            schema,
            UserSchema,
            'Expected user schema does not match'
          );
          assert.deepEqual(
            queryOptions,
            findByIdOptions,
            'Expected query options does not match'
          );
          return callback(null, userData);
        });

      sinon.stub(DbOperationHelper.prototype, 'save')
        .callsFake((_userRecord, isForUpdate, callback) => {
          assert.deepEqual(
            _userRecord,
            userData,
            'Expected user schema does not match'
          );
          assert.isTrue(
            isForUpdate,
            'Expected is for update flag have to be true while updating user'
          );
          return callback(null, userData);
        });

      const statusSpy = sinon.spy((_statusCode) => {
        assert.equal(_statusCode, 200, 'Expected status code in response does not match');
        return res;
      });
      const jsonSpy = sinon.spy((response) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger should expected to be called once');
        assert.equal(nextSpy.callCount, 0, 'Expected next not to be called in success');
        assert.deepEqual(
          response,
          userData.getUserDetail(),
          'Expected user response does not match'
        );
        done();
      });
      const res = {
        status: statusSpy,
        json: jsonSpy
      };
      const nextSpy = sinon.spy();
      const service = new UserService(logger(loggerSpy));
      service.updateUserById(swaggerParams, res, nextSpy);
    });
  });
});