const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const { uras } = require('../../app/api');
const config = require('../../config');

function verify (req, res, next) {
  const token = req.token;
  jwt.verify(token, config.JWT_TOKEN, (err, decoded) => {
    if (err) {
      res.status(403).send({message: '로그인 토큰 이상함'});
    }
    req.user = decoded;
    next();
  });
}

router.get('/uras', verify, uras.getUras)
      .post('/uras', verify, uras.createUra);

module.exports = router;