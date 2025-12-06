const router = require('express').Router();
const { controller } = require('./user.controller');
const { models } = require('./user.model');

const { token } = require('../../utils/validateToken');

router.post('/register', models.register, _validexpress, controller.register);
router.post('/login', models.login, _validexpress, controller.login);
router.post('/google', models.google, _validexpress, controller.googleLogin);
router.get('/verify', token.valid, controller.verifySession);

module.exports = router;
