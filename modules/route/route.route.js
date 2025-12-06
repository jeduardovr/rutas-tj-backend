const router = require('express').Router();
const { controller } = require('./route.controller');
const { models } = require('./route.model');

router.get('/', _validexpress, controller.getAll);
router.post('/', _validtoken, models.create, _validexpress, controller.create);
router.post('/propose', _validtoken, models.propose, _validexpress, controller.propose);
router.get('/pending', _validtoken, controller.getPendingProposals);
router.put('/pending/:id', _validtoken, controller.updateProposal);
router.put('/delete', _validtoken, models.delete, _validexpress, controller.delete);
router.post('/:id/approve', _validtoken, models.approveProposal, _validexpress, controller.approveProposal);
router.post('/:id/reject', _validtoken, models.rejectProposal, _validexpress, controller.rejectProposal);
router.get('/:id', _validexpress, controller.getById);
router.put('/:id', _validtoken, models.update, _validexpress, controller.update);

module.exports = router;