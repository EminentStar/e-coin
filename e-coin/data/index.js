const Sequelize = require('Sequelize');
const User = require('./user');
const Ura = require('./ura');
const sequelize = require('./sequelize');

User.hasMany(Ura, { foreignKey: 'owner' });

module.exports = {
  sequelize,
  User,
  Ura,
}

  