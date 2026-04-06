const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/summary', auth, roleCheck('admin', 'analyst', 'viewer'), dashboardController.getSummary);
router.get('/categories', auth, roleCheck('admin', 'analyst', 'viewer'), dashboardController.getCategoryTotals);
router.get('/trends', auth, roleCheck('admin', 'analyst'), dashboardController.getMonthlyTrends);
router.get('/recent', auth, roleCheck('admin', 'analyst', 'viewer'), dashboardController.getRecentActivity);

module.exports = router;