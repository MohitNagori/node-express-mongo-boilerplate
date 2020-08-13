'use strict';
const fs = require('fs');
const stt = require('swagger-test-templates');
const jsYaml = require('js-yaml');
// eslint-disable-next-line no-sync
const swagger = jsYaml.safeLoad(fs.readFileSync('./api/swagger.yaml'));
const config = {
  assertionFormat: 'should',
  testModule: 'request',
  pathName: []
};
const tests = stt.testGen(swagger, config);
tests.pop();
tests.forEach((element) => {
  fs.writeFile('./testcases/e2e/' + element.name, element.test, (err) => {
    if (err) {throw err;}
  });
}, this);