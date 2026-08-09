const express = require('express');
const { listPatients, getPatient, updatePatient } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('doctor', 'admin'), listPatients);
router.get('/:id', protect, getPatient);
router.put('/:id', protect, updatePatient);

module.exports = router;
