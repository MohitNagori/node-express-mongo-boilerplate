'use strict';
const config = require('config');
const {assert} = require('chai');
const sinon = require('sinon');
const configIndex = require('../../config');

/**
 * @TestSuite config index
 * @description - Test the config index
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
describe('config Module:- Test Scenarios', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('Test the scenario of return config when no env pass', () => {
    const _config = configIndex();
    assert.deepEqual(
      _config,
      config,
      'Expected config object not returned'
    );
  });

  it('Test the scenario of return config when valid env pass', () => {
    sinon.stub(process, 'env').value({NODE_ENV: 'testing'});
    const _config = configIndex();
    assert.deepEqual(
      _config,
      config,
      'Expected config object not returned'
    );
  });

  it('Test the scenario of error when invalid env pass', (done) => {
    sinon.stub(console, 'log');
    sinon.stub(process, 'env').value({NODE_ENV: 'someInvalidEnv'});
    sinon.stub(process, 'exit').callsFake((exitCode) => {
      assert.equal(exitCode, 1, 'Expected exit code does not match');
      done();
    });
    configIndex();
  });
});