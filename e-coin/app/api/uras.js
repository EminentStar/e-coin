const express = require('express');
const { sequelize, User, Ura, Path } = require('../../data');

module.exports = {
  getUras(req, res) {
    const userId = req.user.id;
    let { offset, limit } = req.body;

    if (!offset) offset = 0;
    if (!limit || limit > 10) limit = 10;

    Ura.findAndCountAll({
      where: {
        owner: userId,
      },
      limit,
      offset,
    })
    .then((reply) => {
      res.set('X-ECOIN-Total-Count', reply.count)
      res.send(reply.rows);
    });
  },
  getUra(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    let { offset, limit } = req.body;

    if (!offset) offset = 0;
    if (!limit || limit > 10) limit = 10;

    Ura
    .findOne({
      where: {
        id,
        owner: userId,
      },
    })
    .then((reply) => {
      res.send(reply);
    });
  },
  createUra(req, res) {
    const userId = req.user.id;
    const { current } = req.body;

    Ura.create({ owner: userId, current })
    .then((result) => {
      res.send(result);
    });
  },
  transferUra(req, res) {
    const userId = req.user.id;
    const { id: ura } = req.params;
    const { to } = req.body;
    const result = { };

    return sequelize.transaction((transaction) => {
      return Ura.find({
        where: {
          id: ura,
          owner: userId,
        }, transaction
      })
      .then((foundUra) => {
        if (!foundUra) throw new Error('소유한 Uranium을 찾을 수 없습니다.');
        else return Path.create({
          from: userId,
          to,
          ura,
        }, { transaction })
      })
      .then((path) => {
        result.path = path;
        return Ura.update({
          owner: to,
          lastedPath: path.id
        }, {
          where: { id: ura },
          transaction,
        });
      })
      .then((updatedCount) => {
        if (updatedCount[0] !== 1) throw new Error('해당하는 Ura를 찾을 수 없음');
        else return User.findOne({ where: { id: userId }, transaction });
      })
      .then((fromUser) => {
        result.user = { };
        result.user.from = fromUser;
        return User.findOne({ where: { id: to }, transaction });
      })
      .then((toUser) => {
        result.user.to = toUser;
        return Ura.findOne({ where: { id: ura }, transaction });
      })
      .then((updatedUra) => {
        result.ura = updatedUra;
        return User.update({
          ura: result.user.from.ura - result.ura.current,
        }, {
          where: { id: userId },
          transaction,
        });
      })
      .then((updatedCount) => {
        if (updatedCount[0] !== 1) throw new Error('Updated된 From User를 찾을 수 없음');
        else return User.update({
          ura: result.user.to.ura + result.ura.current,
        }, {
          where: { id: to },
          transaction,
        });
      })
      .then((updatedCount) => {
        if (updatedCount[0] !== 1) throw new Error('Updated된 To User를 찾을 수 없음');
        else return;
      })
    }).then(() => {
      result.user.from.ura -= result.ura.current;
      result.user.to.ura += result.ura.current;
      res.send(result);
    }).catch((err) => {
      console.log('트랜젝션 실패');
      console.log(err.message);
      
      res.status(500).send({
        message: '트랙젝션 실패',
        error: err.message,
      });
    });
  },
  changeUra(req, res) {
    const userId = req.user.id;
    const { id: ura } = req.params;
    const { bank, current } = req.body;
    
    return sequelize.transaction((transaction) => {
      return Path.create({
        from: userId,
        to: bank,
        ura,
      }, { transaction })
      .then((path) => {
        result.path = path;
        return Ura.update({
          owner: bank,
          lastedPath: path.id
        },{
          where: { id: ura },
        });
      })
      .then((updatedCount) => {
        if (updatedCount[0] !== 1) throw new Error('해당하는 Ura를 찾을 수 없음');
        else {
          bankAccount.request.deposit(current)
        }
      })
    }).then((reply) => {
      result.ura = reply;
      res.send(result);
    }).catch((err) => {
      console.log('트랜젝션 실패');
      console.log(err);
      res.status(500).send({message: '트랙젝션 실패'});
    });
  },
}