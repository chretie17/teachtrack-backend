const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getAttendanceHistory } = require('../controllers/teacherController');

router.post('/checkin', checkIn);
router.post('/checkout', checkOut);
router.get('/history', getAttendanceHistory);

module.exports = router;
