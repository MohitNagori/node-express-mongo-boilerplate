'use strict';
const config = require('config');
const {assert} = require('chai');
const sinon = require('sinon');
const {redisClientHelper} = require('../../helpers');

/**
 * @TestSuite redis client helper
 * @description - Test the redis client helper
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
describe('redisClientHelper Module:- Test Scenarios', () => {
  beforeEach(() => {
    sinon.stub(console, 'log');
  });
  afterEach(() => {
    sinon.restore();
  });

  it('Test the scenario when config not pass for redis', (done) => {
    sinon.stub(process, 'exit').callsFake((exitCode) => {
      assert.equal(exitCode, 1, 'Expected exit code does not match');
      done();
    });
    redisClientHelper({});
  });

  it('Test the scenario when mongo config not pass for redis', (done) => {
    sinon.stub(process, 'exit').callsFake((exitCode) => {
      assert.equal(exitCode, 1, 'Expected exit code does not match');
      done();
    });
    redisClientHelper({someOtherConfig: 12});
  });

  it('Test the scenario when redis connected successfully', (done) => {
    let redisClient = redisClientHelper(config);
    sinon.stub(redisClient.stream, 'on')
      .callsFake((eventName) => {
        assert.equal(eventName, 'connect', 'Expected event name does not match');
        done();
      });
    redisClient.emit('connect');
  });

  it('Test the scenario when error occurred in redis operation', (done) => {
    sinon.stub(process, 'exit').callsFake((exitCode) => {
      assert.equal(exitCode, 1, 'Expected exit code does not match');
      done();
    });
    let redisClient = redisClientHelper(config);
    redisClient.emit('error');
  });
});