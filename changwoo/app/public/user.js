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
    .findOne({
      where: { email, password }
    })
    .then((reply) => {
      if (!reply) return res.status(500).send({message: '로그인할 수 없습니다.'});
      const token = jwt.sign(reply.dataValues, config.JWT_TOKEN);
      res.send(token);
    });
  }

}