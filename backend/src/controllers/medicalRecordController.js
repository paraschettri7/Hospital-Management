const { validationResult } = require('express-validator');
const MedicalRecord = require('../models/MedicalRecord');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../middleware/asyncHandler');

function assertValid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(400, errors.array()[0].msg);
}

function assertAccess(req, patientId) {
  const isSelf = req.user.role === 'patient' && req.user.id === patientId;
  const isStaff = req.user.role === 'doctor' || req.user.role === 'admin';
  if (!isSelf && !isStaff) throw new ApiError(403, 'You do not have access to these records');
}

// POST /api/medical-records/:patientId — doctor writes a record
const createRecord = asyncHandler(async (req, res) => {
  assertValid(req);
  const { patientId } = req.params;
  const { diagnosis, prescription, notes, appointmentId } = req.body;

  const record = await MedicalRecord.create({
    patient: patientId,
    doctor: req.user.id,
    appointment: appointmentId || undefined,
    diagnosis,
    prescription,
    notes,
  });
  res.status(201).json({ record });
});

// GET /api/medical-records/:patientId — patient (own) / doctor / admin
const getRecords = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  assertAccess(req, patientId);
  const records = await MedicalRecord.find({ patient: patientId })
    .populate('doctor', 'name')
    .sort({ date: -1 });
  res.json({ records });
});

module.exports = { createRecord, getRecords };
