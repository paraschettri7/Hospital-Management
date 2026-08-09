const express = require('express');
const { body } = require('express-validator');
const { createRecord, getRecords } = require('../controllers/medicalRecordController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/:patientId',
  protect,
  authorize('doctor'),
  [body('diagnosis').trim().notEmpty().withMessage('Diagnosis is required')],
  createRecord
);
router.get('/:patientId', protect, getRecords);

module.exports = router;
