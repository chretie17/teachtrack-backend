const express = require('express');
const router = express.Router();
const absenceController = require('../controllers/absenceController');

router.post('/', absenceController.submitAbsenceRequest);

router.get('/pending', absenceController.getPendingAbsenceRequests);

router.put('/status', absenceController.updateAbsenceStatus);

// Route to get absence history for a specific teacher
router.get('/history/:teacher_id', absenceController.getAbsenceHistoryForTeacher);

module.exports = router;
