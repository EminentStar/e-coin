const Sequelize = require('sequelize');
const sequelize = require('./sequelize');

module.exports = sequelize.define('pay', {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
  money: {
    type: Sequelize.INTEGER,  
  },
  user: {
    type: Sequelize.UUID,
  },
  used: {
    type: Sequelize.BOOLEAN,
  },
},{
});