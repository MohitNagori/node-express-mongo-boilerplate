'use strict';
const winston = require('winston');
const winstonDailyRotateFile = require('winston-daily-rotate-file');
const config = require('config');
const Colorizer = winston.format.colorize();
const logLevel = config.get('LOGGER.level');

// Set log format in a proper structure
let format = winston.format.combine(
  winston.format.timestamp({
    format: 'DD/MMM/YYYY h:mm:ss a'
  }),
  winston.format.printf((args) => {
    return Colorizer.colorize(
      args.level,
      JSON.stringify(
        Object.assign(
          {},
          args,
          {requestId: logger.reqId, originalUrl: logger['originalUrl']}
        )
      ));
  })
);
// Create winston logger instance with console and daily rotate file transformer to store logs
let logger = winston.createLogger({
  transports: [
    new (winston.transports.Console)({
      format: format,
      level: logLevel,
      silent: logLevel === 'none',
      handleExceptions: true
    }),
    new winstonDailyRotateFile({
      filename: './logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      level: logLevel,
      silent: logLevel === 'none',
      maxSize: '20m',
      maxFiles: '7d',
      format: format
    })
  ],
  exitOnError: false // do not exit on handled exceptions
});

// Set the base data to attach the originalUrl and requestId
logger.setBaseData = (reqData) => {
  logger.reqId = reqData['requestId'];
  logger.originalUrl = reqData['originalUrl'];
};

/**
 * @module winston-logger
 * @description - Winston logger for consistent logging format over the system.
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
module.exports = logger;
