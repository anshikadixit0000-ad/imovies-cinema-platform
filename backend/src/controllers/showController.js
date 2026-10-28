const { getIsConnected } = require('../config/db');
const Show = require('../models/Show');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const memoryStore = require('../config/memoryStore');
const { generateSeatLayout } = require('../utils/seatGenerator');

// @desc    Get shows with filtering by movie, theatre, date
// @route   GET /api/shows
const getShows = async (req, res) => {
  try {
    const { movieId, theatreId, date } = req.query;

    if (getIsConnected()) {
      let query = {};
      if (movieId) query.movie = movieId;
      if (theatreId) query.theatre = theatreId;
      if (date) query.showDate = date;

      const shows = await Show.find(query)
        .populate('movie', 'title posterUrl duration rating genres languages')
        .populate('theatre', 'name city address screens')
        .sort({ showDate: 1, showTime: 1 });

      return res.json({ success: true, count: shows.length, data: shows });
    } else {
      let shows = await memoryStore.find('shows');
      if (movieId) shows = shows.filter(s => String(s.movie) === String(movieId));
      if (theatreId) shows = shows.filter(s => String(s.theatre) === String(theatreId));
      if (date) shows = shows.filter(s => s.showDate === date);

      // Hydrate with movie & theatre info
      const hydrated = await Promise.all(shows.map(async s => {
        const movie = await memoryStore.findById('movies', s.movie);
        const theatre = await memoryStore.findById('theatres', s.theatre);
        return {
          ...s,
          movie: movie ? { _id: movie._id, title: movie.title, posterUrl: movie.posterUrl, duration: movie.duration, rating: movie.rating, genres: movie.genres, languages: movie.languages } : s.movie,
          theatre: theatre ? { _id: theatre._id, name: theatre.name, city: theatre.city, address: theatre.address, screens: theatre.screens } : s.theatre
        };
      }));

      return res.json({ success: true, count: hydrated.length, data: hydrated });
    }
  } catch (error) {
    console.error('getShows error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving shows' });
  }
};

// @desc    Get show by ID (with full seat map)
// @route   GET /api/shows/:id
const getShowById = async (req, res) => {
  try {
    const { id } = req.params;

    if (getIsConnected()) {
      const show = await Show.findById(id)
        .populate('movie')
        .populate('theatre');

      if (!show) return res.status(404).json({ success: false, message: 'Show not found' });
      return res.json({ success: true, data: show });
    } else {
      const show = await memoryStore.findById('shows', id);
      if (!show) return res.status(404).json({ success: false, message: 'Show not found' });

      const movie = await memoryStore.findById('movies', show.movie);
      const theatre = await memoryStore.findById('theatres', show.theatre);

      return res.json({
        success: true,
        data: {
          ...show,
          movie,
          theatre
        }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving show details' });
  }
};

// @desc    Create a new show (Admin)
// @route   POST /api/shows
const createShow = async (req, res) => {
  try {
    const { movieId, theatreId, screenNumber, showDate, showTime, ticketPrices } = req.body;

    const prices = ticketPrices || { standard: 180, premium: 280, vip: 450 };
    const seats = generateSeatLayout(['A', 'B', 'C', 'D', 'E', 'F'], 10, prices);

    const showData = {
      movie: movieId,
      theatre: theatreId,
      screenNumber: Number(screenNumber) || 1,
      showDate, // e.g. "2026-10-30"
      showTime, // e.g. "07:00 PM"
      ticketPrices: prices,
      seats
    };

    let created;
    if (getIsConnected()) {
      created = await Show.create(showData);
    } else {
      created = await memoryStore.create('shows', showData);
    }

    res.status(201).json({ success: true, message: 'Show scheduled successfully', data: created });
  } catch (error) {
    console.error('createShow error:', error);
    res.status(500).json({ success: false, message: 'Server error creating show' });
  }
};

// @desc    Delete show (Admin)
// @route   DELETE /api/shows/:id
const deleteShow = async (req, res) => {
  try {
    let deleted;
    if (getIsConnected()) {
      deleted = await Show.findByIdAndDelete(req.params.id);
    } else {
      deleted = await memoryStore.findByIdAndDelete('shows', req.params.id);
    }

    if (!deleted) return res.status(404).json({ success: false, message: 'Show not found' });
    res.json({ success: true, message: 'Show deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting show' });
  }
};

module.exports = { getShows, getShowById, createShow, deleteShow };
