const express = require('express');
const router = express.Router();
const { verifyAttendance, getPendingVerifications } = require('../controllers/supervisorController');

router.post('/verify', verifyAttendance);
router.get('/pending', getPendingVerifications);

module.exports = router;
