'use strict';
const _ = require('lodash');
const {DB_CONSTANT} = require('../constants');

/**
 * @class DbOperationHelper
 * @description - Database operation helper functionality
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
class DbOperationHelper {

  /**
   * @constructor
   *
   * @param {Object} logger - The logger object
   *
   * @member {Object} this.logger - The logger object
   */
  constructor(logger) {
    this.logger = logger;
  }

  /**
   * @method count
   * @description - Provide count functionality of record from collection of MongoDB.
   * @note - Give a result in a integer.
   *
   * @param {Model} model - The Collection Schema model on which you want to perform operation.
   * @param {Object} query - Query you want to apply for an operation.
   * @param {function} callback - The callback use to pass the result async.
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  count(model, query, callback) {
    model.countDocuments(query, (error, resultCount) => {
      if (error) {
        this.logger.error(
          `An error occurred while counting the records for [${model.collection.collectionName}] collection`,
          {query: query, originalError: error}
        );
        return callback(error);
      }
      return callback(null, resultCount);
    });
  }

  /**
   * @method find
   * @description - Provide find multiple records functionality of MongoDB.
   * @note - Given a result in array form.
   *
   * options:
   * options.query - Query you want to apply for an operation.
   * options.queryOption - Mongoose find query option object.
   * options.isLean - Flag use for a use a lean select to improve performance.
   * [provide plain object instead of mongoose model]
   * options.sortingObj - The sorting object to perform soring with query [optional]
   *
   * @param {Model} model - The Collection Schema model on which you want to perform operation.
   * @param {Object} options - Different options for find method
   * @param {function} callback - The callback use to pass the result async.
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  find(model, options, callback) {
    let supportOption = _.merge({
      logger: this.logger,
      method: 'find'
    }, options);
    return _executeOperation(model, supportOption, callback);
  }

  /**
   * @method findById
   * @description - Provide findById functionality of MongoDB.
   * @note - Given a single result in object form matched with passed ID.
   *
   * options:
   * options.query - Document object id you want to apply for an operation.
   * options.queryOption - Mongoose findById query option object.
   * options.isLean - Flag use for a use a lean select to improve performance.
   * [provide plain object instead of mongoose model]
   *
   * @param {Model} model - The Collection Schema model on which you want to perform operation.
   * @param {Object} options - The options require to use findById method
   * @param {function} callback - The callback use to pass the result async.
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  findById(model, options, callback) {
    let supportOption = _.merge({
      logger: this.logger,
      method: 'findById'
    }, options);
    return _executeOperation(model, supportOption, callback);
  }

  /**
   * @method findOne
   * @description - Provide findOne functionality of MongoDB.
   * @note - Given a single result in object form.
   *
   * options:
   * options.query - Query you want to apply for an operation.
   * options.queryOption - Mongoose findOne query option object.
   * options.isLean - Flag use for a use a lean select to improve performance.
   * [provide plain object instead of mongoose model]
   * options.sortingObj - The sorting object to perform soring with query [optional]
   *
   * @param {Model} model - The Collection Schema model on which you want to perform operation.
   * @param {Object} options - The options required for findOne method
   * @param {function} callback - The callback use to pass the result async.
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  findOne(model, options, callback) {
    let supportOption = _.merge({
      logger: this.logger,
      method: 'findOne'
    }, options);
    return _executeOperation(model, supportOption, callback);
  }

  /**
   * @method findOneAndRemove
   * @description - Provide remove single record functionality of MongoDB.
   * @note - Given an object in a result(But not a updated record) after deleting from DB
   *
   * @param {Model} model - The Collection Schema model on which you want to perform operation.
   * @param {Object} query - Query you want to apply for an operation.
   * @param {function} callback - The callback use to pass the result async.
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  findOneAndRemove(model, query, callback) {
    model.findOneAndRemove(query, (error, record) => {
      if (error) {
        this.logger.error(
          `An error occurred while retrieving and deleting the data from 
          [${model.collection.collectionName}] collection`,
          {query: query, originalError: error}
        );
        return callback(error);
      }
      return callback(null, record);
    });
  }

  /**
   * @method removeAll
   * @description - Provide remove multiple records functionality of MongoDB.
   * @note - Given an object in a result(But not a updated record) after deleting from DB
   *
   * @param {Model} model - The Collection Schema model on which you want to perform operation.
   * @param {Object} query - Query you want to apply for an operation.
   * @param {function} callback - The callback use to pass the result async.
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  removeAll(model, query, callback) {
    model.deleteMany(query, (error) => {
      if (error) {
        this.logger.error(
          `An error occurred while deleting the data from [${model.collection.collectionName}] collection`,
          {query: query, originalError: error}
        );
        return callback(error);
      }
      return callback();
    });
  }

  /**
   * @method save
   * @description - Provide save functionality of MongoDB.
   * @note - Given a single result in object after save into a database
   *
   * @param {Model} model - The Collection Schema model on which you want to perform operation.
   * @param {Boolean} isForUpdate - Use to indicate that passing model use for update
   * @param {function} callback - The callback use to pass the result async.
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  save(model, isForUpdate, callback) {
    if (isForUpdate) {
      // If model record does not modified then no need to perform a unnecessary db call
      if (!model.isModified()) {
        return callback(null, model);
      }
      model.increment();
    }
    model.save((error, resultData) => {
      if (error) {
        let operation = isForUpdate ? 'updating' : 'saving';
        let errorPrefix = error.code === DB_CONSTANT.DUPLICATE_KEY_ERROR ? 'A validation' : 'An';
        this.logger.error(
          `${errorPrefix} error occurred while ${operation} the data into 
          [${model.collection.collectionName}] collection`,
          {data: model.toJSON(), originalError: error}
        );
        return callback(error);
      }
      return callback(null, resultData);
    });
  }

  /**
   * @method update
   * @description - Provide update functionality of MongoDB.
   * @note - Given an object in a result(But not a updated record) after updating the Model
   *
   * options:
   * options.query - Query you want to apply for an operation.
   * options.updateObj - Value to be update in model
   * options.updateOption - Mongoose update method option object.
   *
   * @param {Model} model - The Collection Schema model on which you want to perform operation.
   * @param {Object} options - The options required to perform a update method
   * @param {function} callback - The callback use to pass the result async.
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  update(model, options, callback) {
    return model.update(options.query, options.updateObj, options.updateOption, (error, resultData) => {
      if (error) {
        this.logger.error(
          `An error occurred while updating the data into [${model.collection.collectionName}] collection`,
          {data: options.updateObj, query: options.query, originalError: error}
        );
        return callback(error);
      }
      return callback(null, resultData);
    });
  }

  /**
   * @method pagination
   * @description - Provide pagination functionality on mongodb collection.
   * @note - Given a result in array form.
   *
   * options:
   * options.query - Query you want to apply for an operation.
   * options.queryOption - Mongoose find query option object.
   * options.paginationOption - Pagination options. Contains `page`, `itemsPerPage`, `sortingObj`
   *
   * @param {Model} model - The Collection Schema model on which you want to perform operation.
   * @param {Object} options - The options required to perform pagination method
   * @param {function} callback - The callback use to pass the result async.
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  pagination(model, options, callback) {
    const pagination = options.paginationOption;
    let page = pagination.page;
    let itemsPerPage = pagination.itemsPerPage;
    let supportOption = _.merge({
      sortingObj: pagination.sortingObj,
      method: 'find',
      isForPagination: true
    }, options);

    let baseOpration = _executeOperation(model, supportOption);
    return baseOpration.skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .lean()
      .exec((error, resultData) => {
        if (error) {
          this.logger.error(
            `An error occurred while performing pagination on collection [${model.collection.collectionName}]`,
            {query: supportOption.query, sortBy: supportOption.sortingObj,
              queryOptions: supportOption.queryOption, originalError: error}
          );
          return callback(error);
        }
        return callback(null, resultData);
      });
  }
}

module.exports = DbOperationHelper;

/**
 * @function _executeOperation
 * @description- Common method to use to retrieve the from model with passed method for passed query.
 * Common error log format all over the system.
 *
 * @param {Model} model - The Collection Schema model on which you want to perform operation.
 * @param {Object} options - The required option object to perform operation
 * @param {function} callback - The callback use to pass the result async.
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 *
 * @private
 * @returns {Object | function} - Either execute the query or return generic query model
 */
function _executeOperation(model, options, callback) {
  let baseOpration = model[options.method](options.query, options.queryOption);
  if (options.method !== 'findById' && options.sortingObj) {
    baseOpration.sort(options.sortingObj);
  }
  // return from here if request from pagination.
  if (options.isForPagination) {
    return baseOpration;
  }
  if (options.isLean) {
    baseOpration.lean();
  }
  return baseOpration.exec((error, resultData) => {
    if (error) {
      options.logger.error(
        `An error occurred while retrieving the data from [${model.collection.collectionName}] collection`,
        {query: options.query, originalError: error}
      );
      return callback(error);
    }
    return callback(null, resultData);
  });
}