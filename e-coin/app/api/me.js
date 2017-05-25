const { User } = require('../../data');

module.exports = {
  getMe(req, res) {
    const id = req.user.id;

    User.findOne({ id })
    .then((reply) => {
      res.send(reply);
    });
  },
}