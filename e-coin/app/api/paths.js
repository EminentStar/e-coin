const _ = require('lodash');
const { sequelize, Ura, Path } = require('../../data');

module.exports = {
  getPaths(req, res) {
    const userId = req.user.id;
    const { id: uraId } = req.params;
    let { offset, limit } = req.body;

    const where = {
      $or: [
        { from: userId },
        { to: userId },
      ],
    };

    if (uraId) _.merge(where, {ura: uraId});
    if (!offset) offset = 0;
    if (!limit || limit > 10) limit = 10;

    Path.findAndCountAll({
      where,
      limit,
      offset,
    })
    .then((reply) => {
      res.set('X-ECOIN-Total-Count', reply.count);
      res.send(reply.rows);
    })
  },
  getAllPaths(req, res) {
    const userId = req.user.id;
    let { offset, limit } = req.body;

    if (!offset) offset = 0;
    if (!limit || limit > 10) limit = 10;

    Path.findAndCountAll({
      where: {
        $or: [
          { from: userId },
          { to: userId },
        ],
      },
      limit,
      offset,
    })
    .then((reply) => {
      res.send(reply);
    })
  },
}