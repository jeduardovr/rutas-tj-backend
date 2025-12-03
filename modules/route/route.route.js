const router = require('express').Router();
const { controller } = require('./route.controller');

// ==========================================
// Rutas Privadas (Requieren Token)
// ==========================================

// Rutas base (/route)
router.route('/')
    .get(controller.getAll)
    .post(controller.create)

router.route('/:id')
    .get(controller.getById)
    .put(controller.update)

module.exports = router;