'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const process = require('process');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];

const db = {};
const databases = Object.keys(config.databases);

function syncDb() {
  Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });
}

for (let i = 0; i < databases.length; ++i) {
  let database = databases[i];
  let dbPath = config.databases[database];

  db[database] = new Sequelize(
    dbPath.database,
    dbPath.username,
    dbPath.password,
    dbPath
  );
}

// fs
//   .readdirSync(__dirname + '/pettazzoni/')
//   .filter(file =>
//     (file.indexOf('.') !== 0) &&
//     (file !== basename) &&
//     (file.slice(-3) === '.js'))
//   .forEach(file => {
//     const model = require(path.join(__dirname + '/pettazzoni', file))(db.pettazzoni, Sequelize);
//     db[model.name] = model;

//   });
// db.pettazzoni.sync()
// syncDb();

// fs
//   .readdirSync(__dirname + '/gourmel/')
//   .filter(file =>
//     (file.indexOf('.') !== 0) &&
//     (file !== basename) &&
//     (file.slice(-3) === '.js'))
//   .forEach(file => {
//     const model = require(path.join(__dirname + '/gourmel', file))(db.gourmel, Sequelize);
//     db[model.name] = model;
//   });
// db.gourmel.sync()
// syncDb();

fs
  .readdirSync(__dirname + '/production/')
  .filter(file =>
    (file.indexOf('.') !== 0) &&
    (file !== basename) &&
    (file.slice(-3) === '.js'))
  .forEach(file => {
    const model = require(path.join(__dirname + '/production', file))(db.production, Sequelize);
    db[model.name] = model;
  });
db.production.sync()
syncDb();

module.exports = db;