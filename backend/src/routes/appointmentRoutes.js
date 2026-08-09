const express = require('express');
const { body } = require('express-validator');
const {
  createAppointment,
  getAvailability,
  myAppointments,
  listAppointments,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('patient'),
  [
    body('doctorId').notEmpty().withMessage('doctorId is required'),
    body('date').isISO8601().withMessage('A valid date is required'),
    body('timeSlot').notEmpty().withMessage('timeSlot is required'),
  ],
  createAppointment
);

router.get('/availability', protect, getAvailability);
router.get('/mine', protect, authorize('patient', 'doctor'), myAppointments);
router.get('/', protect, authorize('admin'), listAppointments);
router.put('/:id', protect, updateAppointmentStatus);

module.exports = router;
