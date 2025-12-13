const router = require('express').Router();
const { controller } = require('./community.controller');
const { models } = require('./community.model');

router.get('/', controller.getAll);
router.post('/', _validtoken, models.createPost, _validexpress, controller.create);
router.post('/:id/reply', _validtoken, models.replyPost, _validexpress, controller.reply);

module.exports = router;
