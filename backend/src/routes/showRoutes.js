const express = require('express');
const router = express.Router();
const { getShows, getShowById, createShow, deleteShow } = require('../controllers/showController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getShows);
router.get('/:id', getShowById);
router.post('/', protect, adminOnly, createShow);
router.delete('/:id', protect, adminOnly, deleteShow);

module.exports = router;
