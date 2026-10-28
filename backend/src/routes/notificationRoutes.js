const express = require('express');
const router = express.Router();
const { getIsConnected } = require('../config/db');
const Notification = require('../models/Notification');
const memoryStore = require('../config/memoryStore');
const { protect } = require('../middleware/auth');

// @desc    Get user notifications
// @route   GET /api/notifications
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    if (getIsConnected()) {
      const notes = await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(20);
      res.json({ success: true, data: notes });
    } else {
      const all = await memoryStore.find('notifications');
      const userNotes = all.filter(n => String(n.user) === String(userId)).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      res.json({ success: true, data: userNotes.slice(0, 20) });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
router.put('/:id/read', protect, async (req, res) => {
  try {
    if (getIsConnected()) {
      await Notification.findByIdAndUpdate(req.params.id, { read: true });
    } else {
      await memoryStore.findByIdAndUpdate('notifications', req.params.id, { read: true });
    }
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating notification' });
  }
});

module.exports = router;
