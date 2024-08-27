const express = require('express');
const router = express.Router();
const supervisorController = require('../controllers/supervisorController');

// Teacher management routes
router.get('/teachers', supervisorController.getAllTeachers);
router.put('/teachers/:id', supervisorController.updateTeacher);
router.delete('/teachers/:id', supervisorController.deleteTeacher);

// Attendance management routes
router.get('/attendance', supervisorController.getAllAttendanceRecords);
router.put('/attendance/approve/:id', supervisorController.approveAttendance);

module.exports = router;
