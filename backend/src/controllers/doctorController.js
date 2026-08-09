const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/doctors — public listing (name + specialization + availability)
const listDoctors = asyncHandler(async (req, res) => {
  const profiles = await DoctorProfile.find()
    .populate('user', 'name email phone isActive')
    .lean();
  const doctors = profiles
    .filter((p) => p.user && p.user.isActive)
    .map((p) => ({
      id: p.user._id,
      profileId: p._id,
      name: p.user.name,
      email: p.user.email,
      phone: p.user.phone,
      specialization: p.specialization,
      department: p.department,
      bio: p.bio,
      availability: p.availability,
    }));
  res.json({ doctors });
});

const getDoctor = asyncHandler(async (req, res) => {
  const profile = await DoctorProfile.findOne({ user: req.params.id }).populate(
    'user',
    'name email phone isActive'
  );
  if (!profile) throw new ApiError(404, 'Doctor not found');
  res.json({ doctor: profile });
});

// PUT /api/doctors/:id — doctor updates own profile, admin can update any
const updateDoctor = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    throw new ApiError(403, 'You can only update your own profile');
  }
  const { specialization, department, bio, availability } = req.body;
  const profile = await DoctorProfile.findOneAndUpdate(
    { user: req.params.id },
    { $set: { specialization, department, bio, availability } },
    { new: true, runValidators: true }
  );
  if (!profile) throw new ApiError(404, 'Doctor not found');
  res.json({ doctor: profile });
});

module.exports = { listDoctors, getDoctor, updateDoctor };
