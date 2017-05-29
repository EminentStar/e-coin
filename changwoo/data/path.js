const Sequelize = require('sequelize');
const sequelize = require('./sequelize');

module.exports = sequelize.define('path', {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
  from: {
    type: Sequelize.UUID,  
  },
  to: {
    type: Sequelize.UUID,
  },
  ura: {
    type: Sequelize.UUID,
  },
},{
});