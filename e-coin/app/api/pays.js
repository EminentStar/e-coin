const _ = require('lodash');
const { sequelize, Ura, User, Pay, Path } = require('../../data');
const bankAccount = require('../bank');
const config = require('../../config');

module.exports = {
  getList(req, res) {
    const id = req.user.id;

    return Pay.findAll({
      where: { user: id },
    })
    .then((reply) => {
      res.send(reply);
    });
  },
  payMoney(req, res) {
    const id = req.user.id;
    const { money } = req.body;

    return Pay.create({
      user: id,
      money: Number(money),
    })
    .then((reply) => {
      res.send(reply);
    });
  },
  changeToUra(req, res) {
    const id = req.user.id;
    const { money } = req.body;

    return sequelize.transaction((transaction) => {
      return Pay.findOne({
        where: { user: id, money, used: false },
      })
      .then((reply) => {
      if (!reply) throw new Error('결제 내역을 찾을 수 없습니다.');

      return reply.update({ used: true }, { transaction });
      })
      .then((reply) => {
        console.log('lets use admin');
        const uras = parseInt(money / 100);
        return bankAccount.chargeUra({ uras, userId: id });
      })
    })
    .then((reply) => {
      res.send(reply);
    })
    .catch((err) => {
      console.log('트랜젝션 실패');
      console.log(err);

      res.status(500).send({
        message: '트랜젝션 실패',
        error: err.message,
      });
    })
  },
}