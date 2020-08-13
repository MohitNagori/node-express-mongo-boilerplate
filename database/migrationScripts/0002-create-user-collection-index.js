'use strict';

const indexObj = {
  email: 1
};

const indexOptions = {
  unique: true
};
exports.id = '0002-create-user-collection-index';

exports.up = function up(done) {
  this.db.collection('Users').createIndex(indexObj, indexOptions, done);
};

exports.down = function down(done) {
  this.db.collection('Users').dropIndex(indexObj, done);
};