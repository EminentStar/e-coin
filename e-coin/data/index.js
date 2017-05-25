const Sequelize = require('Sequelize');
const User = require('./user');
const Ura = require('./ura');

User.hasMany(Ura, { foreignKey: 'owner' });

module.exports = {
  User,
  Ura,
}

  