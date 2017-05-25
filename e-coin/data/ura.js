const Sequelize = require('sequelize');
const config = require('../config');

const MYSQL_HOST = config.MYSQL_HOST;
const MYSQL_USER = config.MYSQL_USER;
const MYSQL_PASSWORD = config.MYSQL_PASSWORD;
const MYSQL_DB = config.MYSQL_DB;

const sequelize = new Sequelize(MYSQL_DB, MYSQL_USER, MYSQL_PASSWORD, {
  host: MYSQL_HOST,
  dialect: 'mysql',

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
});

module.exports = sequelize.define('ura', {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
  current: {
    type: Sequelize.INTEGER,
  },
  owner: {
    type: Sequelize.UUID,
  },
},{
  defaultScope: {
    attributes: {
      exclude: ['owner', 'createdAt', 'updatedAt'],
    }
  },
});