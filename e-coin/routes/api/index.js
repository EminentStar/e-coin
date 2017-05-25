const _ = require('lodash');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const { banks, uras, paths, me } = require('../../app/api');
const config = require('../../config');

function verify (req, res, next) {
  const token = req.token;
  jwt.verify(token, config.JWT_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send({message: '로그인 토큰 이상함'});
    }
    req.user = decoded;

    if (isBank(req.user.id)) req.user.isBank = true;
    next();
  });
}

function isBank(userId) {
  if (_.indexOf(config.BANK_ACCOUNT, userId) == -1) return false;
  else return true;
}

function verifyBank(req, res, next) {
  const userId = req.user.id;

  if (!isBank(userId)) {
    return res.status(500).send({ message: '은행 계좌가 아닙니다.' });
  }

  req.user.isBank = true;
  next();
}

router.get('/me', verify, me.getMe);

router.get('/banks', verify, banks.isBank);

router.get('/uras', verify, uras.getUras)
      .post('/uras', verify, verifyBank, uras.createUra)
      .get('/uras/:id', verify, uras.getUra)
      .get('/uras/:id/paths', verify, paths.getPaths)
      .put('/uras/:id', verify, uras.transferUra)
      .post('/uras/divide', verify, verifyBank, uras.divideUra)
      .post('/uras/merge', verify, verifyBank, uras.mergeUra);

router.get('/paths', verify, paths.getPaths);

module.exports = router;