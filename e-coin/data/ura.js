const Sequelize = require('sequelize');
const sequelize = require('./sequelize');

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