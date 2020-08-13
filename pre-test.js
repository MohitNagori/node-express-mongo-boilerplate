'use strict';
const config = require('config');
const mongoose = require('mongoose');
const supportedEnv = ['ci', 'testing'];
if (!process.env.NODE_ENV || !supportedEnv.includes(process.env.NODE_ENV)) {
  // eslint-disable-next-line no-console
  console.log('Process environment not supported, supported env', supportedEnv);
  return process.exit(1);
}
mongoose.connect(config.get('MONGODB.url'), config.get('MONGODB.options'));
let connection = mongoose.connection;
connection.once('open', () => {
  connection.db.dropDatabase((error) => {
    if (error) {
      throw error;
    }
    // Successfully database has been drop
    return process.exit(0);
  });
});
connection.on('error', (error) => {
  if (error) {
    throw error;
  }
});