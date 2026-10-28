const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  screens: [{
    screenNumber: { type: Number, required: true },
    name: { type: String, default: 'Screen 1' },
    soundSystem: { type: String, default: 'Dolby Atmos 7.1' },
    totalSeats: { type: Number, default: 60 }
  }]
}, { timestamps: true });

theatreSchema.index({ city: 1, name: 1 });

module.exports = mongoose.model('Theatre', theatreSchema);
