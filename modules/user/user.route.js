const router = require('express').Router();
const { controller } = require('./user.controller');
const { models } = require('./user.model');
const { validateExpress } = require('../../utils/validateExpress');

router.post('/register', models.register, controller.register);
router.post('/login', models.login, controller.login);
router.post('/google', models.google, controller.googleLogin);

module.exports = router;
