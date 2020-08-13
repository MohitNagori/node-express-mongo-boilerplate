'use strict';
/**
 * @module TestUtils
 * @description - Provide utilities for test cases
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
module.exports = {
  /**
   * @method logger
   * @description - Logger stub for all the used logged to spy
   *
   * @param {sinon.spy} spy - The sinon spy function
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  logger: (spy) => {
    return {
      info: spy,
      debug: spy,
      error: spy,
      warn: spy,
      silly: spy,
      verbose: spy
    };
  },

  /**
   * @method zSchemaCustomFormat
   * @description - Z-Schema Custom formatter
   *
   * @param {Z-Schema} zSchema - The Z-Schema instance
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  zSchemaCustomFormat: (zSchema) => {
    // Placeholder file for all custom-formats in known to swagger.json
    // as found on
    // https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#dataTypeFormat

    let decimalPattern = /^\d{0,8}.?\d{0,4}[0]+$/;

    /** Validates floating point as decimal / money (i.e: 12345678.123400..) */
    zSchema.registerFormat('double', (val) => {
      return !decimalPattern.test(val.toString());
    });

    /** Validates value is a 32bit integer */
    zSchema.registerFormat('int32', (val) => {
      // the 32bit shift (>>) truncates any bits beyond max of 32
      return Number.isInteger(val) && ((val >> 0) === val);
    });

    zSchema.registerFormat('int64', (val) => {
      return Number.isInteger(val);
    });

    zSchema.registerFormat('float', (val) => {
      // better parsing for custom "float" format
      if (Number.parseFloat(val)) {
        return true;
      } else {
        return false;
      }
    });

    zSchema.registerFormat('date', (val) => {
      // should parse a a date
      return !isNaN(Date.parse(val));
    });

    zSchema.registerFormat('dateTime', (val) => {
      return !isNaN(Date.parse(val));
    });

    zSchema.registerFormat('password',  (val) => {
      // should parse as a string
      return typeof val === 'string';
    });
  },

  /**
   * @description - Default error response schema
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  defaultErrorResponseSchema: {
    'description': 'Unsuccessful operation with any of the response status like 400, 401, 403, 404, 405, 406, 412, 500',
    'type': 'object',
    'properties': {
      'code': {
        'type': 'string'
      },
      'message': {
        'type': 'string'
      },
      'errors': {
        'type': 'array',
        'items': {
          'type': 'object',
          'properties': {
            'code': {
              'type': 'string'
            },
            'message': {
              'type': 'string'
            },
            'path': {
              'type': 'array'
            }
          }
        }
      }
    },
    'required': [
      'message'
    ]
  }
};