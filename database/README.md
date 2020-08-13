## Database

This folder contains the things which are related to database.

- **migrationScripts:-** Name justify itself that it is responsible for migration task with a database.
below structure of the migration scripts.
```js
exports.id = '<<MigrationScriptId>>'; // Migration script unique id

exports.up = function up(done) {
  // this will responsible for success scenario of migration
};

exports.down = function down(done) {
  // this will responsible for a failure scenario of migration. Basically for rollback task.
};
```
**Note:-** The id and file name of a migration script must be start with a digit so, it will execute in that order. Eg. `001-create`, `002-update`.

- **Schemas:-** Contains mongoose schema used over the system. You can mention that Schema reference in a `index.js` to export for over the system to import from the single reference.

- **DbConnection:-** Responsible to manage and establish the connection with the database.

- **DbOperationHelper:-** Provide some basic functionality that you can perform with mongoose collection schema.
You need to pass the logger instance while creating a instance of this helper class, this logger will log the error while performing an operations with mongoose schema.

Currently Supported mongoose schema operations by **DbOperationHelper**   

    - count- Provide a number of records count for specified query.
    - find - Provide a array response of record(Multiple records) for specified query and options.
    - findById - Provide a functionality to fetch specific record from database by using the record id.
    - findOne - Provide a single record for specified query.
    - findOneAndRemove - Provide a find and remove the specific record functionality for a specified query.
    - removeAll - Provide the remove all records functionality match with specificed query.
    - save - Provide a upsert functionality for record. Increment the version of record (__v) only when record actually update.
    - update - Provide update functionality on a records for specific query and options.
    - pagination - Provide a pagination functionality on a specific route with query filter, sorting and paginate facility.

**index:-** Export the functionality over the system with importing the single file. 