const PatientProfile = require('../models/PatientProfile');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/patients — admin/doctor only
const listPatients = asyncHandler(async (req, res) => {
  const profiles = await PatientProfile.find().populate('user', 'name email phone isActive');
  res.json({ patients: profiles.filter((p) => p.user && p.user.isActive) });
});

const getPatient = asyncHandler(async (req, res) => {
  if (req.user.role === 'patient' && req.user.id !== req.params.id) {
    throw new ApiError(403, 'You can only view your own profile');
  }
  const profile = await PatientProfile.findOne({ user: req.params.id }).populate(
    'user',
    'name email phone isActive'
  );
  if (!profile) throw new ApiError(404, 'Patient not found');
  res.json({ patient: profile });
});

const updatePatient = asyncHandler(async (req, res) => {
  if (req.user.role === 'patient' && req.user.id !== req.params.id) {
    throw new ApiError(403, 'You can only update your own profile');
  }
  const { dob, gender, address, bloodGroup, emergencyContact } = req.body;
  const profile = await PatientProfile.findOneAndUpdate(
    { user: req.params.id },
    { $set: { dob, gender, address, bloodGroup, emergencyContact } },
    { new: true, runValidators: true }
  );
  if (!profile) throw new ApiError(404, 'Patient not found');
  res.json({ patient: profile });
});

module.exports = { listPatients, getPatient, updatePatient };
