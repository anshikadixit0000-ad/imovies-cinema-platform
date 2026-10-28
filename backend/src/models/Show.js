const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
  screenNumber: { type: Number, default: 1 },
  showDate: { type: String, required: true }, // Format: YYYY-MM-DD
  showTime: { type: String, required: true }, // Format: "10:30 AM", "02:15 PM", etc.
  ticketPrices: {
    standard: { type: Number, default: 180 },
    premium: { type: Number, default: 280 },
    vip: { type: Number, default: 450 }
  },
  // Seat layout configuration & state:
  // Array of seat states e.g. { seatId: "A1", row: "A", col: 1, type: "standard", price: 180, isBooked: false, bookedBy: null }
  seats: [{
    seatId: { type: String, required: true },
    row: { type: String, required: true },
    col: { type: Number, required: true },
    tier: { type: String, enum: ['standard', 'premium', 'vip'], default: 'standard' },
    price: { type: Number, required: true },
    isBooked: { type: Boolean, default: false },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  }]
}, { timestamps: true });

showSchema.index({ movie: 1, theatre: 1, showDate: 1 });

module.exports = mongoose.model('Show', showSchema);
