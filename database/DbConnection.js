'use strict';
const _ = require('lodash');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

/**
 * @module DbConnection
 * @description - Expose the constants over the system
 *
 * @param {Object} config - The configuration object
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 *
 * @return {mongoose.connection} connection - The mongoose connection
 */
module.exports = (config) => {
  if (_.isEmpty(config) || _.isEmpty(config.MONGODB)) {
    // eslint-disable-next-line no-console
    console.log('Required configuration not found while making a connection with database');
    return process.exit(1);
  }
  let mongoUrl = process.env.MONGO_URL || config.MONGODB.url;
  mongoose.connect(mongoUrl, config.MONGODB.options);

  let connection = mongoose.connection;
  connection.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.log('An error occurred while making a connection database', err);
    process.exit(1);
  });

  return connection;
};