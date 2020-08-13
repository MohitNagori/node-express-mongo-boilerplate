'use strict';
const sinon = require('sinon');
const {assert} = require('chai');
const {DbOperationHelper} = require('../../database');
const {logger} = require('../../utils/TestUtils');

/**
 * @TestSuite DbOperationHelper
 * @description - Test the Database Operation Helper Class
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
describe('DbOperationHelper Class:- Test Scenarios', () => {
  let loggerSpy = null;
  let dbOperationHelper;
  beforeEach(() => {
    loggerSpy = sinon.spy();
    dbOperationHelper = new DbOperationHelper(logger(loggerSpy));
  });
  afterEach(() => {
    sinon.restore();
  });

  /**
   * @TestSuite count
   * @description - Test the count method of data base operation helper
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('count() Method:- Test Scenarios', () => {

    it('Test the scenario when error occurred while counting the db records', (done) => {
      const dbError = {
        error: 'someDbError'
      };
      const query = {
        name: 'someName'
      };
      const countDocumentsSpy = sinon.spy((_query, callback) => {
        assert.deepEqual(
          _query,
          query,
          'Expected query does not match'
        );
        return callback(dbError);
      });
      const dbModel = {
        countDocuments: countDocumentsSpy,
        collection: {
          collectionName: 'someCollectionName'
        }
      };
      const callbackSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger expected to be called once');
        assert.deepEqual(
          resError,
          dbError,
          'Expected database error does not match'
        );
        done();
      });
      dbOperationHelper.count(dbModel, query, callbackSpy);
    });

    it('Test the success scenario of counting the db records', (done) => {
      const dbRecordCount = 10;
      const query = {
        name: 'someName'
      };
      const countDocumentsSpy = sinon.spy((_query, callback) => {
        assert.deepEqual(
          _query,
          query,
          'Expected query does not match'
        );
        return callback(null, dbRecordCount);
      });
      const dbModel = {
        countDocuments: countDocumentsSpy,
        collection: {
          collectionName: 'someCollectionName'
        }
      };
      const callbackSpy = sinon.spy((resError, recordCount) => {
        assert.equal(loggerSpy.callCount, 0, 'Logger expected not to be called');
        assert.isNull(resError, 'Expected database error have to be null');
        assert.equal(recordCount, dbRecordCount, 'Expected db records count does not match');
        done();
      });
      dbOperationHelper.count(dbModel, query, callbackSpy);
    });
  });

  /**
   * @TestSuite find
   * @description - Test the find method of data base operation helper
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('find() Method:- Test Scenarios', () => {

    it('Test the error scenario without any additional operation', (done) => {
      const dbError = {
        error: 'someDbError'
      };
      const query = {
        name: 'someName'
      };
      const queryOption = {};
      const findReturn = {
        exec: sinon.spy((callback) => {
          return callback(dbError);
        })
      };
      const findSpy = sinon.spy((_query, _queryOption) => {
        assert.deepEqual(
          _query,
          query,
          'Expected query does not match'
        );
        assert.deepEqual(
          _queryOption,
          queryOption,
          'Expected query options does not match'
        );
        return findReturn;
      });
      const dbModel = {
        find: findSpy,
        collection: {
          collectionName: 'someCollectionName'
        }
      };
      const callbackSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger expected to be called once');
        assert.deepEqual(
          resError,
          dbError,
          'Expected response error does not match'
        );
        done();
      });
      const findOptions = {
        query,
        queryOption
      };
      dbOperationHelper.find(dbModel, findOptions, callbackSpy);
    });

    it('Test the success scenario without any additional operation', (done) => {
      const dbResponse = [{
        data: 'someData'
      }];
      const query = {
        name: 'someName'
      };
      const queryOption = {};
      const findReturn = {
        exec: sinon.spy((callback) => {
          return callback(null, dbResponse);
        })
      };
      const findSpy = sinon.spy((_query, _queryOption) => {
        assert.deepEqual(
          _query,
          query,
          'Expected query does not match'
        );
        assert.deepEqual(
          _queryOption,
          queryOption,
          'Expected query options does not match'
        );
        return findReturn;
      });
      const dbModel = {
        find: findSpy,
        collection: {
          collectionName: 'someCollectionName'
        }
      };
      const callbackSpy = sinon.spy((resError, records) => {
        assert.equal(loggerSpy.callCount, 0, 'Logger expected not to be called');
        assert.isNull(resError, 'Expected response error does not match');
        assert.deepEqual(records, dbResponse, 'Expected database result does not match');
        done();
      });
      const findOptions = {
        query,
        queryOption
      };
      dbOperationHelper.find(dbModel, findOptions, callbackSpy);
    });

    it('Test the success scenario with additional operation', (done) => {
      const dbResponse = [{
        data: 'someData'
      }];
      const query = {
        name: 'someName'
      };
      const queryOption = {};
      const sortingObj = {
        name: 1
      };
      const findReturn = {
        sort: sinon.spy((_sortingObj) => {
          assert.deepEqual(
            _sortingObj,
            sortingObj,
            'Expected sorting object does not match'
          );
          return findReturn;
        }),
        lean: sinon.spy(() => {
          return findReturn;
        }),
        exec: sinon.spy((callback) => {
          return callback(null, dbResponse);
        })
      };
      const findSpy = sinon.spy((_query, _queryOption) => {
        assert.deepEqual(
          _query,
          query,
          'Expected query does not match'
        );
        assert.deepEqual(
          _queryOption,
          queryOption,
          'Expected query options does not match'
        );
        return findReturn;
      });
      const dbModel = {
        find: findSpy,
        collection: {
          collectionName: 'someCollectionName'
        }
      };
      const callbackSpy = sinon.spy((resError, records) => {
        assert.equal(loggerSpy.callCount, 0, 'Logger expected not to be called');
        assert.isNull(resError, 'Expected response error does not match');
        assert.deepEqual(records, dbResponse, 'Expected database result does not match');
        done();
      });
      const findOptions = {
        query,
        queryOption,
        isLean: true,
        sortingObj
      };
      dbOperationHelper.find(dbModel, findOptions, callbackSpy);
    });
  });

  /**
   * @TestSuite findById
   * @description - Test the findById method of data base operation helper
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('findById() Method:- Test Scenarios', () => {

    it('Test the error scenario without any additional operation', (done) => {
      const dbError = {
        error: 'someDbError'
      };
      const query = 'someId';
      const queryOption = {};
      const findByIdReturn = {
        exec: sinon.spy((callback) => {
          return callback(dbError);
        })
      };
      const findByIdSpy = sinon.spy((_query, _queryOption) => {
        assert.deepEqual(
          _query,
          query,
          'Expected query does not match'
        );
        assert.deepEqual(
          _queryOption,
          queryOption,
          'Expected query options does not match'
        );
        return findByIdReturn;
      });
      const dbModel = {
        findById: findByIdSpy,
        collection: {
          collectionName: 'someCollectionName'
        }
      };
      const callbackSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger expected to be called once');
        assert.deepEqual(
          resError,
          dbError,
          'Expected response error does not match'
        );
        done();
      });
      const findByIdOptions = {
        query,
        queryOption
      };
      dbOperationHelper.findById(dbModel, findByIdOptions, callbackSpy);
    });

    it('Test the success scenario without any additional operation', (done) => {
      const dbResponse = {
        data: 'someData'
      };
      const query = 'someId';
      const queryOption = {};
      const findByIdReturn = {
        exec: sinon.spy((callback) => {
          return callback(null, dbResponse);
        })
      };
      const findByIdSpy = sinon.spy((_query, _queryOption) => {
        assert.deepEqual(
          _query,
          query,
          'Expected query does not match'
        );
        assert.deepEqual(
          _queryOption,
          queryOption,
          'Expected query options does not match'
        );
        return findByIdReturn;
      });
      const dbModel = {
        findById: findByIdSpy,
        collection: {
          collectionName: 'someCollectionName'
        }
      };
      const callbackSpy = sinon.spy((resError, records) => {
        assert.equal(loggerSpy.callCount, 0, 'Logger expected not to be called');
        assert.isNull(resError, 'Expected response error does not match');
        assert.deepEqual(records, dbResponse, 'Expected database result does not match');
        done();
      });
      const findByIdOptions = {
        query,
        queryOption
      };
      dbOperationHelper.findById(dbModel, findByIdOptions, callbackSpy);
    });

    it('Test the success scenario with additional operation', (done) => {
      const dbResponse = {
        data: 'someData'
      };
      const query = 'someId';
      const queryOption = {};
      const findByIdReturn = {
        lean: sinon.spy(() => {
          return findByIdReturn;
        }),
        exec: sinon.spy((callback) => {
          return callback(null, dbResponse);
        })
      };
      const findByIdSpy = sinon.spy((_query, _queryOption) => {
        assert.deepEqual(
          _query,
          query,
          'Expected query does not match'
        );
        assert.deepEqual(
          _queryOption,
          queryOption,
          'Expected query options does not match'
        );
        return findByIdReturn;
      });
      const dbModel = {
        findById: findByIdSpy,
        collection: {
          collectionName: 'someCollectionName'
        }
      };
      const callbackSpy = sinon.spy((resError, records) => {
        assert.equal(loggerSpy.callCount, 0, 'Logger expected not to be called');
        assert.isNull(resError, 'Expected response error does not match');
        assert.deepEqual(records, dbResponse, 'Expected database result does not match');
        done();
      });
      const findByIdOptions = {
        query,
        queryOption,
        isLean: true
      };
      dbOperationHelper.findById(dbModel, findByIdOptions, callbackSpy);
    });
  });

  /**
   * @TestSuite findOne
   * @description - Test the findOne method of data base operation helper
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('findOne() Method:- Test Scenarios', () => {

    it('Test the error scenario without any additional operation', (done) => {
      const dbError = {
        error: 'someDbError'
      };
      const query = {
        name: 'someName'
      };
      const queryOption = {};
      const findOneReturn = {
        exec: sinon.spy((callback) => {
          return callback(dbError);
        })
      };
      const findOneSpy = sinon.spy((_query, _queryOption) => {
        assert.deepEqual(
          _query,
          query,
          'Expected query does not match'
        );
        assert.deepEqual(
          _queryOption,
          queryOption,
          'Expected query options does not match'
        );
        return findOneReturn;
      });
      const dbModel = {
        findOne: findOneSpy,
        collection: {
          collectionName: 'someCollectionName'
        }
      };
      const callbackSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger expected to be called once');
        assert.deepEqual(
          resError,
          dbError,
          'Expected response error does not match'
        );
        done();
      });
      const findOneOptions = {
        query,
        queryOption
      };
      dbOperationHelper.findOne(dbModel, findOneOptions, callbackSpy);
    });

    it('Test the success scenario without any additional operation', (done) => {
      const dbResponse = {
        data: 'someData'
      };
      const query = {
        name: 'someName'
      };
      const queryOption = {};
      const findOneReturn = {
        exec: sinon.spy((callback) => {
          return callback(null, dbResponse);
        })
      };
      const findOneSpy = sinon.spy((_query, _queryOption) => {
        assert.deepEqual(
          _query,
          query,
          'Expected query does not match'
        );
        assert.deepEqual(
          _queryOption,
          queryOption,
          'Expected query options does not match'
        );
        return findOneReturn;
      });
      const dbModel = {
        findOne: findOneSpy,
        collection: {
          collectionName: 'someCollectionName'
        }
      };
      const callbackSpy = sinon.spy((resError, records) => {
        assert.equal(loggerSpy.callCount, 0, 'Logger expected not to be called');
        assert.isNull(resError, 'Expected response error does not match');
        assert.deepEqual(records, dbResponse, 'Expected database result does not match');
        done();
      });
      const findOneOptions = {
        query,
        queryOption
      };
      dbOperationHelper.findOne(dbModel, findOneOptions, callbackSpy);
    });

    it('Test the success scenario with additional operation', (done) => {
      const dbResponse = {
        data: 'someData'
      };
      const query = {
        name: 'someName'
      };
      const queryOption = {};
      const sortingObj = {
        name: 1
      };
      const findOneReturn = {
        sort: sinon.spy((_sortingObj) => {
          assert.deepEqual(
            _sortingObj,
            sortingObj,
            'Expected sorting object does not match'
          );
          return findOneReturn;
        }),
        lean: sinon.spy(() => {
          return findOneReturn;
        }),
        exec: sinon.spy((callback) => {
          return callback(null, dbResponse);
        })
      };
      const findOneSpy = sinon.spy((_query, _queryOption) => {
        assert.deepEqual(
          _query,
          query,
          'Expected query does not match'
        );
        assert.deepEqual(
          _queryOption,
          queryOption,
          'Expected query options does not match'
        );
        return findOneReturn;
      });
      const dbModel = {
        findOne: findOneSpy,
        collection: {
          collectionName: 'someCollectionName'
        }
      };
      const callbackSpy = sinon.spy((resError, records) => {
        assert.equal(loggerSpy.callCount, 0, 'Logger expected not to be called');
        assert.isNull(resError, 'Expected response error does not match');
        assert.deepEqual(records, dbResponse, 'Expected database result does not match');
        done();
      });
      const findOneOptions = {
        query,
        queryOption,
        isLean: true,
        sortingObj
      };
      dbOperationHelper.findOne(dbModel, findOneOptions, callbackSpy);
    });
  });

  /**
   * @TestSuite findOneAndRemove
   * @description - Test the findOne and remove method of data base operation helper
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('findOneAndRemove() Method:- Test Scenarios', () => {

    it('Test the scenario when error occurred while finding and removing the db records', (done) => {
      const dbError = {
        error: 'someDbError'
      };
      const query = {
        name: 'someName'
      };
      const findOneAndRemoveSpy = sinon.spy((_query, callback) => {
        assert.deepEqual(
          _query,
          query,
          'Expected query does not match'
        );
        return callback(dbError);
      });
      const dbModel = {
        findOneAndRemove: findOneAndRemoveSpy,
        collection: {
          collectionName: 'someCollectionName'
        }
      };
      const callbackSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger expected to be called once');
        assert.deepEqual(
          resError,
          dbError,
          'Expected database error does not match'
        );
        done();
      });
      dbOperationHelper.findOneAndRemove(dbModel, query, callbackSpy);
    });

    it('Test the success scenario of find and remove the db records', (done) => {
      const dbRecord = {
        data: 'someData'
      };
      const query = {
        name: 'someName'
      };
      const findOneAndRemoveSpy = sinon.spy((_query, callback) => {
        assert.deepEqual(
          _query,
          query,
          'Expected query does not match'
        );
        return callback(null, dbRecord);
      });
      const dbModel = {
        findOneAndRemove: findOneAndRemoveSpy,
        collection: {
          collectionName: 'someCollectionName'
        }
      };
      const callbackSpy = sinon.spy((resError, record) => {
        assert.equal(loggerSpy.callCount, 0, 'Logger expected not to be called');
        assert.isNull(resError, 'Expected database error have to be null');
        assert.equal(record, dbRecord, 'Expected db record does not match');
        done();
      });
      dbOperationHelper.findOneAndRemove(dbModel, query, callbackSpy);
    });
  });

  /**
   * @TestSuite removeAll
   * @description - Test the removeAll method of data base operation helper
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('removeAll() Method:- Test Scenarios', () => {

    it('Test the scenario when error occurred while removing the db records', (done) => {
      const dbError = {
        error: 'someDbError'
      };
      const query = {
        name: 'someName'
      };
      const removeAllSpy = sinon.spy((_query, callback) => {
        assert.deepEqual(
          _query,
          query,
          'Expected query does not match'
        );
        return callback(dbError);
      });
      const dbModel = {
        deleteMany: removeAllSpy,
        collection: {
          collectionName: 'someCollectionName'
        }
      };
      const callbackSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger expected to be called once');
        assert.deepEqual(
          resError,
          dbError,
          'Expected database error does not match'
        );
        done();
      });
      dbOperationHelper.removeAll(dbModel, query, callbackSpy);
    });

    it('Test the success scenario of removeAll the db records', (done) => {
      const query = {
        name: 'someName'
      };
      const removeAllSpy = sinon.spy((_query, callback) => {
        assert.deepEqual(
          _query,
          query,
          'Expected query does not match'
        );
        return callback();
      });
      const dbModel = {
        deleteMany: removeAllSpy,
        collection: {
          collectionName: 'someCollectionName'
        }
      };
      const callbackSpy = sinon.spy((resError, response) => {
        assert.equal(loggerSpy.callCount, 0, 'Logger expected not to be called');
        assert.isUndefined(resError, 'Expected database error have to be undefined');
        assert.isUndefined(response, 'Expected db response have to be undefined');
        done();
      });
      dbOperationHelper.removeAll(dbModel, query, callbackSpy);
    });
  });

  /**
   * @TestSuite save
   * @description - Test the save method of data base operation helper
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('save() Method:- Test Scenarios', () => {

    it('Test the scenario of update the model but model has not been modified', (done) => {
      const dbModel = {
        isModified: () => false
      };
      const callbackSpy = sinon.spy((resError, response) => {
        assert.isNull(resError, 'Expected response error does not match');
        assert.deepEqual(response, dbModel, 'Expected db model does not match');
        done();
      });
      dbOperationHelper.save(dbModel, true, callbackSpy);
    });

    it('Test the scenario of update the model and duplication error occurred while saving the model', (done) => {
      const dbError = {
        code: 11000
      };
      const saveSpy = sinon.spy((callback) => {
        return callback(dbError);
      });
      const dbModel = {
        isModified: () => true,
        increment: () => true,
        save: saveSpy,
        collection: {
          collectionName: 'someCollectionName'
        },
        toJSON: () => {}
      };
      const callbackSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger expected to be called once');
        assert.deepEqual(
          resError,
          dbError,
          'Expected response error does not match'
        );
        done();
      });
      dbOperationHelper.save(dbModel, true, callbackSpy);
    });

    it('Test the scenario of update the model and runtime error occurred while saving the model', (done) => {
      const dbError = {
        error: 'someDbError'
      };
      const saveSpy = sinon.spy((callback) => {
        return callback(dbError);
      });
      const dbModel = {
        isModified: () => true,
        increment: () => true,
        save: saveSpy,
        collection: {
          collectionName: 'someCollectionName'
        },
        toJSON: () => {}
      };
      const callbackSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger expected to be called once');
        assert.deepEqual(
          resError,
          dbError,
          'Expected response error does not match'
        );
        done();
      });
      dbOperationHelper.save(dbModel, true, callbackSpy);
    });

    it('Test the scenario of update the model and successfully save the model', (done) => {
      const dbResponse= {
        data: 'someData'
      };
      const saveSpy = sinon.spy((callback) => {
        return callback(null, dbResponse);
      });
      const dbModel = {
        isModified: () => true,
        increment: () => true,
        save: saveSpy,
        collection: {
          collectionName: 'someCollectionName'
        }
      };
      const callbackSpy = sinon.spy((resError, response) => {
        assert.equal(loggerSpy.callCount, 0, 'Logger expected not to be called');
        assert.isNull(resError, 'Expected db error response have to be null');
        assert.deepEqual(
          response,
          dbResponse,
          'Expected db response does not match'
        );
        done();
      });
      dbOperationHelper.save(dbModel, true, callbackSpy);
    });

    it('Test the scenario for new model and duplication error occurred while saving the model', (done) => {
      const dbError = {
        code: 11000
      };
      const saveSpy = sinon.spy((callback) => {
        return callback(dbError);
      });
      const dbModel = {
        save: saveSpy,
        collection: {
          collectionName: 'someCollectionName'
        },
        toJSON: () => {}
      };
      const callbackSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger expected to be called once');
        assert.deepEqual(
          resError,
          dbError,
          'Expected response error does not match'
        );
        done();
      });
      dbOperationHelper.save(dbModel, false, callbackSpy);
    });

    it('Test the scenario for new model and runtime error occurred while saving the model', (done) => {
      const dbError = {
        error: 'someDbError'
      };
      const saveSpy = sinon.spy((callback) => {
        return callback(dbError);
      });
      const dbModel = {
        save: saveSpy,
        collection: {
          collectionName: 'someCollectionName'
        },
        toJSON: () => {}
      };
      const callbackSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger expected to be called once');
        assert.deepEqual(
          resError,
          dbError,
          'Expected response error does not match'
        );
        done();
      });
      dbOperationHelper.save(dbModel, false, callbackSpy);
    });

    it('Test the scenario for new model and successfully save the model', (done) => {
      const dbResponse= {
        data: 'someData'
      };
      const saveSpy = sinon.spy((callback) => {
        return callback(null, dbResponse);
      });
      const dbModel = {
        save: saveSpy,
        collection: {
          collectionName: 'someCollectionName'
        }
      };
      const callbackSpy = sinon.spy((resError, response) => {
        assert.equal(loggerSpy.callCount, 0, 'Logger expected not to be called');
        assert.isNull(resError, 'Expected db error response have to be null');
        assert.deepEqual(
          response,
          dbResponse,
          'Expected db response does not match'
        );
        done();
      });
      dbOperationHelper.save(dbModel, false, callbackSpy);
    });
  });

  /**
   * @TestSuite update
   * @description - Test the update method of data base operation helper
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('update() Method:- Test Scenarios', () => {

    it('Test the scenario when error occurred while updating the db records', (done) => {
      const dbError = {
        error: 'someDbError'
      };
      const query = {
        name: 'someName'
      };
      const updateObj = {
        name: 'someNewName'
      };
      const updateOption = {
        new: true
      };
      const updateSpy = sinon.spy((_query, _updateObj, _updateOption, callback) => {
        assert.deepEqual(
          _query,
          query,
          'Expected query does not match'
        );
        assert.deepEqual(
          _updateObj,
          updateObj,
          'Expected update object does not match'
        );
        assert.deepEqual(
          _updateOption,
          updateOption,
          'Expected update options does not match'
        );
        return callback(dbError);
      });
      const dbModel = {
        update: updateSpy,
        collection: {
          collectionName: 'someCollectionName'
        }
      };
      const options = {
        query,
        updateObj,
        updateOption
      };
      const callbackSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger expected to be called once');
        assert.deepEqual(
          resError,
          dbError,
          'Expected database error does not match'
        );
        done();
      });
      dbOperationHelper.update(dbModel, options, callbackSpy);
    });

    it('Test the success scenario of update the db records', (done) => {
      const dbResponse = {
        data: 'someData'
      };
      const query = {
        name: 'someName'
      };
      const updateObj = {
        name: 'someNewName'
      };
      const updateOption = {
        new: true
      };
      const updateSpy = sinon.spy((_query, _updateObj, _updateOption, callback) => {
        assert.deepEqual(
          _query,
          query,
          'Expected query does not match'
        );
        assert.deepEqual(
          _updateObj,
          updateObj,
          'Expected update object does not match'
        );
        assert.deepEqual(
          _updateOption,
          updateOption,
          'Expected update options does not match'
        );
        return callback(null, dbResponse);
      });
      const dbModel = {
        update: updateSpy,
        collection: {
          collectionName: 'someCollectionName'
        }
      };
      const options = {
        query,
        updateObj,
        updateOption
      };
      const callbackSpy = sinon.spy((resError, response) => {
        assert.equal(loggerSpy.callCount, 0, 'Logger expected not to be called');
        assert.isNull(resError, 'Expected database error have to be null');
        assert.deepEqual(response, dbResponse, 'Expected db response does not match');
        done();
      });
      dbOperationHelper.update(dbModel, options, callbackSpy);
    });
  });

  /**
   * @TestSuite pagination
   * @description - Test the pagination method of data base operation helper
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('pagination() Method:- Test Scenarios', () => {

    it('Test the scenario when error occurred while using the pagination method', (done) => {
      const dbError = {
        error: 'someDbError'
      };
      const query = {
        name: 'someName'
      };
      const queryOption = {};
      const sortingObj = {
        name: 1
      };
      const paginationOption = {
        page: 2,
        itemsPerPage: 20,
        sortingObj
      };
      const paginationFindReturn = {
        sort: sinon.spy((_sortingObj) => {
          assert.deepEqual(_sortingObj, sortingObj, 'Expected sorting object does not match');
          return paginationFindReturn;
        }),
        skip: sinon.spy((skipCount) => {
          assert.equal(
            skipCount,
            ((paginationOption.page - 1) * paginationOption.itemsPerPage),
            'Expected pagination skip count does not match'
          );
          return paginationFindReturn;
        }),
        limit: sinon.spy((limit) => {
          assert.equal(limit, paginationOption.itemsPerPage, 'Expected limit does not match');
          return paginationFindReturn;
        }),
        lean: sinon.spy(() => {
          return paginationFindReturn;
        }),
        exec: sinon.spy((callback) => {
          return callback(dbError);
        })
      };
      const findSpy = sinon.spy((_query, _queryOption) => {
        assert.deepEqual(
          _query,
          query,
          'Expected query does not match'
        );
        assert.deepEqual(
          _queryOption,
          queryOption,
          'Expected query options does not match'
        );
        return paginationFindReturn;
      });
      const dbModel = {
        find: findSpy,
        collection: {
          collectionName: 'someCollectionName'
        }
      };
      const callbackSpy = sinon.spy((resError) => {
        assert.isAtLeast(loggerSpy.callCount, 1, 'Logger expected to be called once');
        assert.deepEqual(
          resError,
          dbError,
          'Expected response error does not match'
        );
        done();
      });
      const options = {
        query,
        queryOption,
        paginationOption
      };
      dbOperationHelper.pagination(dbModel, options, callbackSpy);
    });

    it('Test the success scenario with result while using the pagination method', (done) => {
      const dbResponse = [{
        data: 'someData'
      }];
      const query = {
        name: 'someName'
      };
      const queryOption = {};
      const sortingObj = {
        name: 1
      };
      const paginationOption = {
        page: 2,
        itemsPerPage: 20,
        sortingObj
      };
      const paginationFindReturn = {
        sort: sinon.spy((_sortingObj) => {
          assert.deepEqual(_sortingObj, sortingObj, 'Expected sorting object does not match');
          return paginationFindReturn;
        }),
        skip: sinon.spy((skipCount) => {
          assert.equal(
            skipCount,
            ((paginationOption.page - 1) * paginationOption.itemsPerPage),
            'Expected pagination skip count does not match'
          );
          return paginationFindReturn;
        }),
        limit: sinon.spy((limit) => {
          assert.equal(limit, paginationOption.itemsPerPage, 'Expected limit does not match');
          return paginationFindReturn;
        }),
        lean: sinon.spy(() => {
          return paginationFindReturn;
        }),
        exec: sinon.spy((callback) => {
          return callback(null, dbResponse);
        })
      };
      const findSpy = sinon.spy((_query, _queryOption) => {
        assert.deepEqual(
          _query,
          query,
          'Expected query does not match'
        );
        assert.deepEqual(
          _queryOption,
          queryOption,
          'Expected query options does not match'
        );
        return paginationFindReturn;
      });
      const dbModel = {
        find: findSpy,
        collection: {
          collectionName: 'someCollectionName'
        }
      };
      const callbackSpy = sinon.spy((resError, response) => {
        assert.equal(loggerSpy.callCount, 0, 'Logger expected not to be called');
        assert.isNull(resError, 'Expected response error does not match');
        assert.deepEqual(
          response,
          dbResponse,
          'Expected db response does not match'
        );
        done();
      });
      const options = {
        query,
        queryOption,
        paginationOption
      };
      dbOperationHelper.pagination(dbModel, options, callbackSpy);
    });
  });
});