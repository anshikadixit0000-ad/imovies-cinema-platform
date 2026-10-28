const { getIsConnected } = require('../config/db');
const Movie = require('../models/Movie');
const memoryStore = require('../config/memoryStore');

// @desc    Get all movies with filters & search & pagination
// @route   GET /api/movies
const getMovies = async (req, res) => {
  try {
    const { genre, language, search, status, page = 1, limit = 20 } = req.query;

    if (getIsConnected()) {
      let query = {};
      if (genre && genre !== 'All') {
        query.genres = { $in: [genre] };
      }
      if (language && language !== 'All') {
        query.languages = { $in: [language] };
      }
      if (status && status !== 'All') {
        query.status = status;
      }
      if (search) {
        query.title = { $regex: search, $options: 'i' };
      }

      const skip = (Number(page) - 1) * Number(limit);
      const total = await Movie.countDocuments(query);
      const movies = await Movie.find(query).sort({ releaseDate: -1 }).skip(skip).limit(Number(limit));

      return res.json({
        success: true,
        count: movies.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        data: movies
      });
    } else {
      let movies = await memoryStore.find('movies');
      if (genre && genre !== 'All') {
        movies = movies.filter(m => (m.genres || []).includes(genre));
      }
      if (language && language !== 'All') {
        movies = movies.filter(m => (m.languages || []).includes(language));
      }
      if (status && status !== 'All') {
        movies = movies.filter(m => m.status === status);
      }
      if (search) {
        const q = search.toLowerCase();
        movies = movies.filter(m => m.title.toLowerCase().includes(q) || (m.description && m.description.toLowerCase().includes(q)));
      }

      const total = movies.length;
      const skip = (Number(page) - 1) * Number(limit);
      const paginated = movies.slice(skip, skip + Number(limit));

      return res.json({
        success: true,
        count: paginated.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
        data: paginated
      });
    }
  } catch (error) {
    console.error('getMovies error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving movies' });
  }
};

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    let movie;
    if (getIsConnected()) {
      movie = await Movie.findById(id);
    } else {
      movie = await memoryStore.findById('movies', id);
    }

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    res.json({ success: true, data: movie });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving movie' });
  }
};

// @desc    Create movie (Admin)
// @route   POST /api/movies
const createMovie = async (req, res) => {
  try {
    const {
      title, description, genres, languages, duration,
      releaseDate, posterUrl, backdropUrl, trailerUrl, rating, director, cast, status, featured
    } = req.body;

    const movieData = {
      title,
      description,
      genres: Array.isArray(genres) ? genres : genres ? genres.split(',').map(s => s.trim()) : ['Action'],
      languages: Array.isArray(languages) ? languages : languages ? languages.split(',').map(s => s.trim()) : ['English'],
      duration: Number(duration) || 120,
      releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
      posterUrl: posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
      backdropUrl: backdropUrl || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
      trailerUrl: trailerUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      rating: Number(rating) || 8.0,
      director: director || '',
      cast: Array.isArray(cast) ? cast : cast ? cast.split(',').map(s => s.trim()) : [],
      status: status || 'Now Showing',
      featured: Boolean(featured)
    };

    let created;
    if (getIsConnected()) {
      created = await Movie.create(movieData);
    } else {
      created = await memoryStore.create('movies', movieData);
    }

    res.status(201).json({ success: true, message: 'Movie created successfully', data: created });
  } catch (error) {
    console.error('createMovie error:', error);
    res.status(500).json({ success: false, message: 'Server error creating movie' });
  }
};

// @desc    Update movie (Admin)
// @route   PUT /api/movies/:id
const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    let updated;
    if (getIsConnected()) {
      updated = await Movie.findByIdAndUpdate(id, req.body, { new: true });
    } else {
      updated = await memoryStore.findByIdAndUpdate('movies', id, req.body);
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    res.json({ success: true, message: 'Movie updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating movie' });
  }
};

// @desc    Delete movie (Admin)
// @route   DELETE /api/movies/:id
const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;
    let deleted;
    if (getIsConnected()) {
      deleted = await Movie.findByIdAndDelete(id);
    } else {
      deleted = await memoryStore.findByIdAndDelete('movies', id);
    }

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    res.json({ success: true, message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting movie' });
  }
};

module.exports = { getMovies, getMovieById, createMovie, updateMovie, deleteMovie };
