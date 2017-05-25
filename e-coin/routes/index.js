const api = require('./api');
const public = require('./public');
const express = require('express');
const router = express.Router();

router.use('/api', api);
router.use('/public', public);

router.get('/', (req, res) => {
  console.log('route');
  res.send();
});

module.exports = router;