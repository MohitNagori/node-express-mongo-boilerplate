'use strict';
const config = require('config');
const mongoose = require('mongoose');
const sinon = require('sinon');
const {assert} = require('chai');
const {dbConnection} = require('../../database');

/**
 * @TestSuite DbConnection
 * @description - Test the db connection module
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
describe('DbConnection Module:- test scenarios', () => {
  beforeEach(() => {
    sinon.stub(console, 'log');
  });
  afterEach(() => {
    sinon.restore();
  });

  it('Test the scenario when config not pass for connection', (done) => {
    sinon.stub(process, 'exit').callsFake((exitCode) => {
      assert.equal(exitCode, 1, 'Expected exit code does not match');
      done();
    });
    dbConnection({});
  });

  it('Test the scenario when mongo config not pass for connection', (done) => {
    sinon.stub(process, 'exit').callsFake((exitCode) => {
      assert.equal(exitCode, 1, 'Expected exit code does not match');
      done();
    });
    dbConnection({someOtherConfig: 12});
  });

  it('Test the scenario when error occurred during the mongo connection', (done) => {
    sinon.stub(mongoose.connection, 'on')
      .callsFake((eventName) => {
        assert.equal(eventName, 'error', 'Expected event name does not match');
      });
    sinon.stub(process, 'exit')
      .callsFake((exitCode) => {
        assert.equal(exitCode, 1, 'Expected exit code does not match');
        done();
      });
    const connection = dbConnection(config);
    connection.emit('error', new Error('someError'));
  });
});