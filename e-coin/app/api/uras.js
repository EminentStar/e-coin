const _ = require('lodash');
const express = require('express');
const { sequelize, User, Ura, Path } = require('../../data');

module.exports = {
  getUras(req, res) {
    const userId = req.user.id;
    let { offset, limit } = req.body;
    const { current } = req.query;

    const options = {
      where: {
        owner: userId,
      },
    };

    if (!offset) offset = 0;
    if (!limit || limit > 10) limit = 10;

    options.offset = offset;
    options.limit = limit;

    if (current) options.where.current = current;

    Ura.findAndCountAll(options)
    .then((reply) => {
      res.set('X-ECOIN-Total-Count', reply.count);
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
  divideUra(req, res) {
    const userId = req.user.id;
    const {
      bank,
      to,
      units: _units,
    } = req.body;
    let deleted;
    const units = JSON.parse(_units);

    return sequelize.transaction((transaction) => {
      return User.findOne({
        where: { id: userId }
      })
      .then((reply) => {
        if (reply.ura < to) return res.status(500).send({ message: '당신 의도가 뭐야?? 돈이 없잖아 ㅠ.ㅠ' });
        return Ura.findOne({
          where: { owner: userId, current: { $gte: to } },
          order: [['createdAt', 'ASC']],
        });
      })
      .then((ura) => {
        if (!ura) throw new Error('적당한 Uranium이 없습니다.');

        let inserts = [ ];
        let srcUras = ura.current;

        if (srcUras == to) return { deleted: null, uras: [ura] };

        ura.destroy();
        deleted = ura;
        
        _.forEach(units, (value) => {
          if (value.unit > to) return;

          const unit = value.unit;
          const quotient = parseInt(srcUras / value.unit);
          inserts = inserts.concat(_.fill(Array(quotient), { owner: userId, current: unit }));
          srcUras %= value.unit;
        });

        return Ura.bulkCreate(inserts, transaction);
      });
    })
    .then((reply) => {
      res.send({ deleted, uras: reply });
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
  mergeUra(req, res) {
    const userId = req.user.id;
    const {
      bank,
      to,
    } = req.body;

    const srcUras = [];
    const deletedUras = [];

    return sequelize.transaction((transaction) => {
      return User.findOne({
        where: { id: userId }
      })
      .then((reply) => {
        if (reply.ura < to) return res.status(500).send({ message: '당신 의도가 뭐야?? 돈이 없잖아 ㅠ.ㅠ' });
        return Ura.findAll({
          where: { owner: userId, current: { $lte: to } },
          order: [['createdAt', 'ASC']],
        });
      })
      .then((uras) => {
        if (_.isEmpty(uras)) throw new Error('적당한 Uranium이 없습니다.');
        let countUras = 0;
        _.forEach(uras, (ura) => {
          countUras += ura.current;
          srcUras.push(ura);
          if (countUras >= to) return false;
        });

        if (_.last(srcUras).current == to) {
          return [_.last(srcUras)];
        }

        _.forEach(srcUras, (ura) => {
          deletedUras.push(ura);
          ura.destroy();
        });
        countUras -= to;
        const inserts = [];
        inserts.push({ owner: userId, current: to });
        if (countUras != 0) inserts.push({ owner: userId, current: countUras });
        return Ura.bulkCreate(inserts, transaction);
      });
    })
    .then((reply) => {
      res.send({ deletedUras, mergedUras: reply });
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