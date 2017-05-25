const express = require('express');
const { sequelize, Ura, Path } = require('../../data');

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
      res.send(reply);
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
      return Path.create({
        from: userId,
        to,
        ura,
      }, { transaction })
      .then((path) => {
        result.path = path;
        return Ura.update({
          lastedPath: path.id
        },{
          where: { id: ura },
        });
      })
      .then((updatedCount) => {
        if (updatedCount[0] !== 1) throw new Error('해당하는 Ura를 찾을 수 없음');
        else return Ura.find({ where: { id: ura } })
        .then((reply) => {
          return reply;
        })
      })
    }).then((reply) => {
      result.ura = reply;
      res.send(result);
    }).catch((err) => {
      console.log('트랜젝션 실패');
      console.log(err);
      res.status(500).send({message: '트랙젝션 실패'});
    });
  }
}