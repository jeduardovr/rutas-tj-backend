const router = require('express').Router();
const { controller } = require('./user.controller');
const { models } = require('./user.model');
const { validateExpress } = require('../../utils/validateExpress');

router.post('/register', models.register, _validexpress, controller.register);
router.post('/login', models.login, _validexpress, controller.login);
router.post('/google', models.google, _validexpress, controller.googleLogin);

module.exports = router;
