const Sequelize = require('sequelize');
const sequelize = require('./sequelize');

module.exports = sequelize.define('user', {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
  name: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING
  },
  password: {
    type: Sequelize.STRING
  },
},{
  defaultScope: {
    attributes: {
      exclude: ['password', 'createdAt', 'updatedAt'],
    }
  },
});