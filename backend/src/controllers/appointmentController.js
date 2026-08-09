const { validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../middleware/asyncHandler');

function assertValid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(400, errors.array()[0].msg);
}

// POST /api/appointments — patient books an appointment
const createAppointment = asyncHandler(async (req, res) => {
  assertValid(req);
  const { doctorId, date, timeSlot, reason } = req.body;

  const doctor = await User.findOne({ _id: doctorId, role: 'doctor', isActive: true });
  if (!doctor) throw new ApiError(404, 'Doctor not found');

  const clash = await Appointment.findOne({
    doctor: doctorId,
    date: new Date(date),
    timeSlot,
    status: { $in: ['pending', 'confirmed'] },
  });
  if (clash) throw new ApiError(409, 'That time slot is already booked');

  const appointment = await Appointment.create({
    patient: req.user.id,
    doctor: doctorId,
    date,
    timeSlot,
    reason,
  });
  res.status(201).json({ appointment });
});

// GET /api/appointments/availability?doctorId=&date= — booked slots for that
// doctor/day, so the client can grey them out when building the time grid.
const getAvailability = asyncHandler(async (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) throw new ApiError(400, 'doctorId and date are required');

  const appointments = await Appointment.find({
    doctor: doctorId,
    date: new Date(date),
    status: { $in: ['pending', 'confirmed'] },
  }).select('timeSlot');

  res.json({ bookedSlots: appointments.map((a) => a.timeSlot) });
});

// GET /api/appointments/mine — patient's own, or doctor's own
const myAppointments = asyncHandler(async (req, res) => {
  const filter =
    req.user.role === 'doctor' ? { doctor: req.user.id } : { patient: req.user.id };
  const appointments = await Appointment.find(filter)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name email')
    .sort({ date: 1, timeSlot: 1 });
  res.json({ appointments });
});

// GET /api/appointments — admin: all appointments
const listAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find()
    .populate('patient', 'name email')
    .populate('doctor', 'name email')
    .sort({ date: -1 });
  res.json({ appointments });
});

// PUT /api/appointments/:id — confirm/cancel/complete
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const allowed = ['pending', 'confirmed', 'completed', 'cancelled'];
  if (status && !allowed.includes(status)) throw new ApiError(400, 'Invalid status');

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ApiError(404, 'Appointment not found');

  const isOwnerPatient = req.user.role === 'patient' && appointment.patient.toString() === req.user.id;
  const isOwnerDoctor = req.user.role === 'doctor' && appointment.doctor.toString() === req.user.id;
  if (!isOwnerPatient && !isOwnerDoctor && req.user.role !== 'admin') {
    throw new ApiError(403, 'You do not have permission to modify this appointment');
  }
  // Patients may only cancel; doctors/admins may set any status.
  if (isOwnerPatient && status && status !== 'cancelled') {
    throw new ApiError(403, 'Patients can only cancel an appointment');
  }

  if (status) appointment.status = status;
  if (notes !== undefined && (isOwnerDoctor || req.user.role === 'admin')) {
    appointment.notes = notes;
  }
  await appointment.save();
  res.json({ appointment });
});

module.exports = {
  createAppointment,
  getAvailability,
  myAppointments,
  listAppointments,
  updateAppointmentStatus,
};
