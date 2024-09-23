const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Existing Routes
router.get('/teacher/:teacher_id', attendanceController.getClassesForTeacher);
router.post('/mark', attendanceController.markAttendance);
router.get('/unapproved', attendanceController.getUnapprovedAttendance);
router.put('/approve/:id', attendanceController.approveAttendance);
router.get('/history/teacher/:teacher_id', attendanceController.getAttendanceHistoryForTeacher);
router.get('/unapproved-attendance-count', attendanceController.getUnapprovedAttendanceCount);

// New Routes

// 1. Generate QR Code for a class
router.post('/generate-qrcode', attendanceController.generateQRCode);

// 2. Mark attendance using QR Code (JWT-based)
router.post('/mark-qr-attendance', attendanceController.markAttendanceUsingQRCode);

module.exports = router;
