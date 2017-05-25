const { User, Ura } = require('../../data');
const config = require('../../config');
const jwt = require('jsonwebtoken');

module.exports = {
  getUser(req, res) {
    const { id } = req.params;
    User.findOne({ where: { id }, include: Ura })
    .then((reply) => {
      res.send(reply);
    });
  },
  createUser(req, res) {
    const {name, email, password} = req.body;
    console.log('POST /public/user/');
    console.log(name, email, password);

    User
    .create({ name, email, password })
    .then((result) => {
      res.send(result);
    });
  },
  loginUser(req, res) {
    const {email, password} = req.body;
    User
    .findOne({email, password})
    .then((reply) => {
      console.log(reply.dataValues);
      const token = jwt.sign(reply.dataValues, config.JWT_TOKEN);
      res.send(token);
    });
  }

}