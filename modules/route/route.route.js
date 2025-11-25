const router = require('express').Router();
const { controller } = require('./route.controller');

// ==========================================
// Rutas Privadas (Requieren Token)
// ==========================================

// Rutas base (/routes)
router.route('/')
    .get(_validexpress, controller.getAll)

module.exports = router;