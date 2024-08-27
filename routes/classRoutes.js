// routes/classRoutes.js
const express = require('express');
const router = express.Router();
const classesController = require('../controllers/classController');

// CRUD routes
router.post('/', classesController.createClass);
router.get('/', classesController.getClasses);
router.put('/:id', classesController.updateClass);
router.delete('/:id', classesController.deleteClass);

// Get all teachers
router.get('/teachers', classesController.getAllTeachers);

module.exports = router;
