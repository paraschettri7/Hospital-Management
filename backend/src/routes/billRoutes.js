const express = require('express');
const { body } = require('express-validator');
const { createBill, getBills, payBill } = require('../controllers/billController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/:patientId',
  protect,
  authorize('doctor', 'admin'),
  [body('items').isArray({ min: 1 }).withMessage('At least one billing item is required')],
  createBill
);
router.get('/:patientId', protect, getBills);
router.put('/:id/pay', protect, authorize('patient', 'admin'), payBill);

module.exports = router;
