const router = require('express').Router();
const { controller } = require('./route.controller');

// ==========================================
// Rutas Privadas (Requieren Token)
// ==========================================

// Rutas base (/route)
router.route('/')
    .get(_validexpress, controller.getAll)
    .post(_validexpress, controller.create)

router.route('/:id')
    .put(_validexpress, controller.update)

module.exports = router;