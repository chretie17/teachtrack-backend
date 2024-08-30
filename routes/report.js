const express = require('express');
const reportController = require('../controllers/reportController');

const router = express.Router();

// Route to fetch attendance summary report
router.get('/attendance-summary', reportController.getAttendanceSummaryReport);

// Route to fetch teacher performance report
router.get('/teacher-performance', reportController.getTeacherPerformanceReport);

// Route to fetch a custom report
router.post('/custom', reportController.getCustomReport);

module.exports = router;
