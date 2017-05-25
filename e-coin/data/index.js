const Sequelize = require('Sequelize');
const User = require('./user');
const Ura = require('./ura');
const Path = require('./path');
const sequelize = require('./sequelize');

User.hasMany(Ura, { foreignKey: 'owner' });
Ura.hasMany(Path, { foreignKey: 'ura' });

module.exports = {
  sequelize,
  User,
  Ura,
  Path,
}