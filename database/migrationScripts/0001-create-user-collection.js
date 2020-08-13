'use strict';

exports.id = '0001-create-user-collection';

exports.up = function up(done) {
  this.db.createCollection('Users', done);
};

exports.down = function down(done) {
  this.db.collection('Users').drop(done);
};