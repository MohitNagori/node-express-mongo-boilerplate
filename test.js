'use strict';
const config = require('config');
const fs = require('fs');
const Mocha = require('mocha');
const path = require('path');
const mocha = new Mocha(config.get('MOCHA_OPTIONS'));
const testDirPath = './testcases/';
//eslint-disable-next-line  no-unused-vars
const app = require('./index');

// Run the test cases dir based on priority
const testDirPriority = [
  'config',
  'helpers',
  'handlers',
  'database',
  'api',
  'e2e'
];

//files to exclude
const excludeFileAndDir = [
  'README.md',
  'e2eHelper'
];
let currentDirPath = '';

testDirPriority.forEach((dirName) => {
  currentDirPath = testDirPath + dirName;
  loadDir(currentDirPath);
});

/**
 * @function addFileToMocha
 * @description- Add the file to mocha runner
 *
 * @param {String} filePath - The file path to add.
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 *
 * @private
 */
function addFileToMocha(filePath) {
  mocha.addFile(filePath);
}

/**
 * @function loadDir
 * @description- Add the files from dir path to mocha runner
 *
 * @param {String} dirPath - The directory path to process.
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 *
 * @private
 */
function loadDir(dirPath) {
  // eslint-disable-next-line no-sync
  fs.readdirSync(dirPath).sort().forEach((file) => {
    if (!excludeFileAndDir.includes(file)) {
      const currentPath = path.join(dirPath, file);
      // eslint-disable-next-line no-sync
      if (fs.lstatSync(currentPath).isDirectory()) {
        return loadDir(currentPath);
      // eslint-disable-next-line no-sync
      } else if (fs.lstatSync(currentPath).isFile()) {
        addFileToMocha(currentPath);
      }
    }
  });
}
setTimeout(() => {
  mocha.run((failures) => {
    return process.exit(failures ? 1 : 0);  // exit with non-zero status if there were failures
  });
}, 1500);
