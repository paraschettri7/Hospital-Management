const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');
const asyncHandler = require('../middleware/asyncHandler');

const getStats = asyncHandler(async (req, res) => {
  const [totalPatients, totalDoctors, appointmentsByStatus, billsSummary] = await Promise.all([
    User.countDocuments({ role: 'patient', isActive: true }),
    User.countDocuments({ role: 'doctor', isActive: true }),
    Appointment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Bill.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$totalAmount' },
        },
      },
    ]),
  ]);

  const appointmentCounts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  appointmentsByStatus.forEach((row) => {
    appointmentCounts[row._id] = row.count;
  });

  const billing = { unpaid: { count: 0, total: 0 }, paid: { count: 0, total: 0 } };
  billsSummary.forEach((row) => {
    billing[row._id] = { count: row.count, total: row.total };
  });

  res.json({
    totalPatients,
    totalDoctors,
    appointments: appointmentCounts,
    billing,
  });
});

module.exports = { getStats };
