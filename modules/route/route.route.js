const router = require('express').Router();
const { controller } = require('./route.controller');
const { models } = require('./route.model');

router.get('/', _validexpress, controller.getAll);
router.post('/', _validtoken, models.create, _validexpress, controller.create);
router.get('/:id', _validexpress, controller.getById);
router.put('/:id', _validtoken, models.update, _validexpress, controller.update);

module.exports = router;