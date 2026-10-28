const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  genres: [{ type: String, required: true }],
  languages: [{ type: String, required: true }],
  duration: { type: Number, required: true }, // in minutes
  releaseDate: { type: Date, required: true },
  posterUrl: { type: String, required: true },
  backdropUrl: { type: String, default: '' },
  trailerUrl: { type: String, default: '' },
  rating: { type: Number, default: 8.5 },
  director: { type: String, default: '' },
  cast: [{ type: String }],
  status: { type: String, enum: ['Now Showing', 'Coming Soon'], default: 'Now Showing' },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

movieSchema.index({ title: 'text', genres: 1, languages: 1 });

module.exports = mongoose.model('Movie', movieSchema);
