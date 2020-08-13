'use strict';
// Public Node modules defining
const express = require('express');
const app = express();
const requestId = require('express-request-id');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const swaggerTools = require('swagger-tools');
const jsYaml = require('js-yaml');
const fs = require('fs');

//Internal helpers and config defining
const config = require('./config')();
const {logger, redisClientHelper, jwtHelper}  = require('./helpers');
const {dbConnection} = require('./database');
// create a connection with database and return connection object for additional use
const dbConnectionObj = dbConnection(config);
const redisClient = redisClientHelper(config);
// Error handler middleware
const {Error} = require('./handlers');
const {ErrorHandler, Forbidden} = Error;

// swagger configuration
const swaggerOptions = {
  controllers: './api/controllers',
  useStubs: false
};
// eslint-disable-next-line no-sync
const swaggerDoc = jsYaml.safeLoad(fs.readFileSync('./api/swagger.yaml'));

//Middleware register with express application
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(requestId({setHeader: false}));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Swagger Middleware initialization
swaggerTools.initializeMiddleware(swaggerDoc, (middleware) => {

  //Custom middle-ware to set logger with request id and original for every request for logging and tracking purpose
  app.use((req, res, next) => {
    req.logger = logger;
    req.logger.setBaseData({
      'originalUrl': req.originalUrl,
      'requestId': req.id
    });
    next();
  });

  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  // Validate Swagger requests
  app.use(middleware.swaggerValidator());

  // Authentication and authorization for route
  app.use(middleware.swaggerSecurity({
    Authorization: (req, def, scopes, callback) => {
      return jwtHelper.verify(scopes, req.logger, redisClient, req, (error) => {
        if (error) {
          return callback(error);
        }
        let allowedOnlyOwnerAndAdmin = req.swagger.operation['x-only-allowed-owner-admin'];
        let userDetail = req.user_detail;
        if (
          !allowedOnlyOwnerAndAdmin ||
          (allowedOnlyOwnerAndAdmin && userDetail.user_role === 'Admin') ||
          (userDetail._id === req.swagger.params.user_id.value)
        ) {
          return callback();
        } else {
          req.logger.warn(`Access denied for a specific route to user with user id [${userDetail._id}]`);
          return callback(Forbidden('Access denied for a specific route'));
        }
      });
    }
  }));

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(swaggerOptions));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi());

  // Error handler
  // eslint-disable-next-line no-unused-vars
  app.use((errObj, req, res, next) => {
    return ErrorHandler(errObj, req, res);
  });

  // Start the server only when the database connection successfully establish
  dbConnectionObj.once('open', () => {
    // eslint-disable-next-line no-console
    console.log('Database successfully connected');
    //Server start on provided port number
    app.listen(config.get('APP_PORT'), (err) => {
      if (err) {
        logger.error('An error occurred during starting the server');
        process.exit(1);
      }
      logger.debug(`Swagger-Ui available on http://localhost:${config.get('APP_PORT')}/docs`);
    });
  });
});

// If the Node process ends, close all the connections
process.on('SIGINT', () => {
  redisClient.quit();
  dbConnectionObj.close(() => {
    return process.exit(0);
  });
});

/**
 * @module App.
 * @description - Index(Main) file of a system.
 * Contains initialization of modules, middleware configuration and start server code.
 * @note - Export the application and different object over the system
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
module.exports = {
  app,
  redisClient
};