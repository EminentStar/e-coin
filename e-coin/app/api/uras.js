const express = require('express');
const { Ura } = require('../../data');

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
  createUra(req, res) {
    const userId = req.user.id;
    const { current } = req.body;

    Ura.create({ owner: userId, current })
    .then((result) => {
      res.send(result);
    });
  },
}