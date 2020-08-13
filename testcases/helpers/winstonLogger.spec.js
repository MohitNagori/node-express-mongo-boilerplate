'use strict';
const {assert} = require('chai');
const {logger} = require('../../helpers');

/**
 * @TestSuite winston logger helper
 * @description - Test the winston logger helper
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
describe('logger Module:- setBaseData Method Test Scenario', () => {
  const loggerObject = logger;
  it('Test the logger object base data set correctly', () => {
    const requestData = {
      requestId: 'testRequestId',
      originalUrl: '/test'
    };
    loggerObject.setBaseData(requestData);
    assert.isDefined(loggerObject.reqId, 'Expected logger request id detail not set');
    assert.isDefined(loggerObject.originalUrl, 'Expected logger original url detail not set');
  });
});