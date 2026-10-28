const { getIsConnected } = require('../config/db');
const Theatre = require('../models/Theatre');
const memoryStore = require('../config/memoryStore');

// @desc    Get all theatres
// @route   GET /api/theatres
const getTheatres = async (req, res) => {
  try {
    const { city } = req.query;
    let theatres;
    if (getIsConnected()) {
      const query = city ? { city: { $regex: city, $options: 'i' } } : {};
      theatres = await Theatre.find(query);
    } else {
      theatres = await memoryStore.find('theatres');
      if (city) {
        theatres = theatres.filter(t => t.city.toLowerCase().includes(city.toLowerCase()));
      }
    }
    res.json({ success: true, count: theatres.length, data: theatres });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving theatres' });
  }
};

// @desc    Get single theatre
// @route   GET /api/theatres/:id
const getTheatreById = async (req, res) => {
  try {
    let theatre;
    if (getIsConnected()) {
      theatre = await Theatre.findById(req.params.id);
    } else {
      theatre = await memoryStore.findById('theatres', req.params.id);
    }
    if (!theatre) return res.status(404).json({ success: false, message: 'Theatre not found' });
    res.json({ success: true, data: theatre });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create theatre (Admin)
// @route   POST /api/theatres
const createTheatre = async (req, res) => {
  try {
    const { name, city, address, screens } = req.body;
    const theatreData = {
      name,
      city,
      address,
      screens: screens && screens.length ? screens : [
        { screenNumber: 1, name: 'Audi 1 (Dolby Atmos)', soundSystem: 'Dolby Atmos 7.1', totalSeats: 60 },
        { screenNumber: 2, name: 'Audi 2 (IMAX 3D)', soundSystem: 'IMAX 12-channel', totalSeats: 60 }
      ]
    };

    let created;
    if (getIsConnected()) {
      created = await Theatre.create(theatreData);
    } else {
      created = await memoryStore.create('theatres', theatreData);
    }

    res.status(201).json({ success: true, message: 'Theatre added', data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating theatre' });
  }
};

// @desc    Delete theatre
// @route   DELETE /api/theatres/:id
const deleteTheatre = async (req, res) => {
  try {
    let deleted;
    if (getIsConnected()) {
      deleted = await Theatre.findByIdAndDelete(req.params.id);
    } else {
      deleted = await memoryStore.findByIdAndDelete('theatres', req.params.id);
    }
    if (!deleted) return res.status(404).json({ success: false, message: 'Theatre not found' });
    res.json({ success: true, message: 'Theatre deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting theatre' });
  }
};

module.exports = { getTheatres, getTheatreById, createTheatre, deleteTheatre };
