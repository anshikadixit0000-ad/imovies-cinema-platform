const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transactionId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['Card', 'UPI', 'NetBanking', 'Wallet'], default: 'Card' },
  status: { type: String, enum: ['Success', 'Pending', 'Failed', 'Refunded'], default: 'Success' },
  gatewayResponse: { type: Object, default: {} }
}, { timestamps: true });

paymentSchema.index({ transactionId: 1, user: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
