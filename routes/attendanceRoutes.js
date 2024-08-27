const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.get('/teacher/:teacher_id', attendanceController.getClassesForTeacher);
router.post('/mark', attendanceController.markAttendance);

router.get('/unapproved', attendanceController.getUnapprovedAttendance);
router.put('/approve/:id', attendanceController.approveAttendance);

module.exports = router;
