const Sequelize = require('Sequelize');
const User = require('./user');
const Ura = require('./ura');
const Path = require('./path');
const Pay = require('./pay');
const sequelize = require('./sequelize');

User.hasMany(Ura, { foreignKey: 'owner' });
Ura.hasMany(Path, { foreignKey: 'ura' });

module.exports = {
  sequelize,
  User,
  Ura,
  Path,
  Pay,
}