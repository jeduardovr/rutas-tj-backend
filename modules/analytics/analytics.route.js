const router = require('express').Router();
const { controller } = require('./analytics.controller');

// Public endpoint to record visit
router.post('/visit', controller.recordVisit);

// Protected endpoint for admin stats
router.get('/stats', _validtoken, controller.getDashboardStats);

module.exports = router;
