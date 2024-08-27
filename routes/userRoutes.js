// routes/usersRoutes.js
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/userController');

router.post('/', usersController.createUser); // Create user
router.get('/', usersController.getUsers); // Read all users
router.put('/:id', usersController.updateUser); // Update user
router.delete('/:id', usersController.deleteUser); // Delete user

module.exports = router;
