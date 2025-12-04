const router = require('express').Router();
const { controller } = require('./route.controller');
const { models } = require('./route.model');

router.get('/', _validexpress, controller.getAll);
router.post('/', _validtoken, models.create, _validexpress, controller.create);
router.post('/propose', _validtoken, models.create, _validexpress, controller.propose);
router.get('/pending', _validtoken, controller.getPendingProposals);
router.post('/:id/approve', _validtoken, controller.approveProposal);
router.post('/:id/reject', _validtoken, controller.rejectProposal);
router.get('/:id', _validexpress, controller.getById);
router.put('/:id', _validtoken, models.update, _validexpress, controller.update);

module.exports = router;