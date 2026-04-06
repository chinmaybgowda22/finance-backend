const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('admin'), usersController.getAllUsers);
router.get('/:id', auth, roleCheck('admin'), usersController.getUserById);
router.put('/:id', auth, roleCheck('admin'), usersController.updateUser);
router.delete('/:id', auth, roleCheck('admin'), usersController.deleteUser);

module.exports = router;