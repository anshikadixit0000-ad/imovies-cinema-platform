const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingReference: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
  seats: [{
    seatId: { type: String, required: true },
    tier: { type: String, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  convenienceFee: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Failed', 'Refunded'], default: 'Paid' },
  bookingStatus: { type: String, enum: ['Confirmed', 'Cancelled'], default: 'Confirmed' },
  showDate: { type: String, required: true },
  showTime: { type: String, required: true },
  paymentMethod: { type: String, default: 'Credit Card' }
}, { timestamps: true });

bookingSchema.index({ user: 1, bookingReference: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
