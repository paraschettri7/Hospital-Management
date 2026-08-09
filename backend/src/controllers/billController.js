const { validationResult } = require('express-validator');
const Bill = require('../models/Bill');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../middleware/asyncHandler');

function assertValid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(400, errors.array()[0].msg);
}

// POST /api/billing/:patientId — admin/doctor creates a bill
const createBill = asyncHandler(async (req, res) => {
  assertValid(req);
  const { patientId } = req.params;
  const { items, appointmentId } = req.body;

  const bill = await Bill.create({
    patient: patientId,
    appointment: appointmentId || undefined,
    items,
  });
  res.status(201).json({ bill });
});

// GET /api/billing/:patientId — patient (own) / doctor / admin
const getBills = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const isSelf = req.user.role === 'patient' && req.user.id === patientId;
  const isStaff = req.user.role === 'doctor' || req.user.role === 'admin';
  if (!isSelf && !isStaff) throw new ApiError(403, 'You do not have access to these bills');

  const bills = await Bill.find({ patient: patientId }).sort({ issuedAt: -1 });
  res.json({ bills });
});

// PUT /api/billing/:id/pay — patient marks own bill paid (mock payment)
const payBill = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id);
  if (!bill) throw new ApiError(404, 'Bill not found');

  const isOwner = req.user.role === 'patient' && bill.patient.toString() === req.user.id;
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'You do not have permission to pay this bill');
  }
  if (bill.status === 'paid') throw new ApiError(400, 'Bill is already paid');

  bill.status = 'paid';
  bill.paidAt = new Date();
  await bill.save();
  res.json({ bill });
});

module.exports = { createBill, getBills, payBill };
