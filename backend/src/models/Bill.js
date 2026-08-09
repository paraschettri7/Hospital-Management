const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    items: { type: [billItemSchema], required: true, validate: (v) => v.length > 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    issuedAt: { type: Date, default: Date.now },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

billSchema.pre('validate', function computeTotal(next) {
  if (this.items && this.items.length) {
    this.totalAmount = this.items.reduce((sum, item) => sum + item.amount, 0);
  }
  next();
});

module.exports = mongoose.model('Bill', billSchema);
