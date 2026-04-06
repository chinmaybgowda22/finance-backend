const express = require('express');
const router = express.Router();
const recordsController = require('../controllers/records.controller');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/', auth, roleCheck('admin', 'analyst'), recordsController.createRecord);
router.get('/', auth, roleCheck('admin', 'analyst', 'viewer'), recordsController.getAllRecords);
router.get('/:id', auth, roleCheck('admin', 'analyst', 'viewer'), recordsController.getRecordById);
router.put('/:id', auth, roleCheck('admin', 'analyst'), recordsController.updateRecord);
router.delete('/:id', auth, roleCheck('admin'), recordsController.deleteRecord);

module.exports = router;