const { validationResult } = require('express-validator');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');
const ApiError = require('../utils/ApiError');
const { signToken } = require('../utils/token');
const asyncHandler = require('../middleware/asyncHandler');

function assertValid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }
}

const register = asyncHandler(async (req, res) => {
  assertValid(req);
  const { name, email, password, role, phone, specialization, department } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const allowedRoles = ['patient', 'doctor'];
  const finalRole = allowedRoles.includes(role) ? role : 'patient';

  const user = await User.create({ name, email, password, role: finalRole, phone });

  if (finalRole === 'patient') {
    await PatientProfile.create({ user: user._id });
  } else if (finalRole === 'doctor') {
    await DoctorProfile.create({
      user: user._id,
      specialization: specialization || 'General Medicine',
      department: department || 'General',
    });
  }

  const token = signToken(user);
  res.status(201).json({ token, user: user.toSafeObject() });
});

const login = asyncHandler(async (req, res) => {
  assertValid(req);
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!user.isActive) throw new ApiError(403, 'This account has been deactivated');

  const token = signToken(user);
  res.json({ token, user: user.toSafeObject() });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

module.exports = { register, login, me };
