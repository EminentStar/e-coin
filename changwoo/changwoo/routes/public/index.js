const { user } = require('../../app/public');
const express = require('express');
const router = express.Router();

router.post('/users', user.createUser);
router.get('/users/:id', user.getUser);
router.post('/users/login', user.loginUser);

module.exports = router;