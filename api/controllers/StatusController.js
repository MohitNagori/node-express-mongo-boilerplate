'use strict';
const {StatusService} = require('../services');

/**
 * @module Status Controller
 * @description - Expose the Status Controller functions
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
module.exports = {
  /**
   * @method getSystemStatus
   * @description - Provide system status
   *
   * @param {RequestObject} req - Incoming request object
   * @param {ResponseObject} res - The response object for incoming request
   * @param (function) next - pass request to next middleware or handler
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   *
   * @returns {void}
   */
  getSystemStatus: (req, res) => {
    let statusService = new StatusService(req.logger);
    statusService.getSystemStatus(req.swagger.params, res);
  }
};