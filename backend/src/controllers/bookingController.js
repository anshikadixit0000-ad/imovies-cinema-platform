const { getIsConnected } = require('../config/db');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const memoryStore = require('../config/memoryStore');
const crypto = require('crypto');

// @desc    Create a new booking and process payment
// @route   POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { showId, seatIds, paymentMethod = 'Credit Card' } = req.body;
    const userId = req.user._id;

    if (!showId || !seatIds || !seatIds.length) {
      return res.status(400).json({ success: false, message: 'Please select valid show and seats' });
    }

    if (getIsConnected()) {
      const show = await Show.findById(showId).populate('movie').populate('theatre');
      if (!show) return res.status(404).json({ success: false, message: 'Show not found' });

      // Verify seats are available
      const selectedSeats = [];
      for (const sId of seatIds) {
        const seatObj = show.seats.find(s => s.seatId === sId);
        if (!seatObj) {
          return res.status(400).json({ success: false, message: `Seat ${sId} does not exist in this show` });
        }
        if (seatObj.isBooked) {
          return res.status(400).json({ success: false, message: `Seat ${sId} is already booked!` });
        }
        selectedSeats.push(seatObj);
      }

      // Calculate amounts
      const totalAmount = selectedSeats.reduce((acc, s) => acc + s.price, 0);
      const convenienceFee = Math.round(totalAmount * 0.05); // 5%
      const taxAmount = Math.round((totalAmount + convenienceFee) * 0.18); // 18% GST
      const finalAmount = totalAmount + convenienceFee + taxAmount;

      const bookingReference = 'BK-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(2).toString('hex').toUpperCase();

      // Reserve seats in show
      show.seats.forEach(s => {
        if (seatIds.includes(s.seatId)) {
          s.isBooked = true;
          s.bookedBy = userId;
        }
      });
      await show.save();

      // Create booking record
      const booking = await Booking.create({
        bookingReference,
        user: userId,
        show: show._id,
        movie: show.movie._id,
        theatre: show.theatre._id,
        seats: selectedSeats.map(s => ({ seatId: s.seatId, tier: s.tier, price: s.price })),
        totalAmount,
        convenienceFee,
        taxAmount,
        finalAmount,
        paymentStatus: 'Paid',
        bookingStatus: 'Confirmed',
        showDate: show.showDate,
        showTime: show.showTime,
        paymentMethod
      });

      // Record payment
      const transactionId = 'TXN-' + crypto.randomBytes(6).toString('hex').toUpperCase();
      await Payment.create({
        booking: booking._id,
        user: userId,
        transactionId,
        amount: finalAmount,
        method: paymentMethod,
        status: 'Success'
      });

      // Send in-app notification
      await Notification.create({
        user: userId,
        title: 'Booking Confirmed!',
        message: `Tickets for ${show.movie.title} on ${show.showDate} at ${show.showTime} confirmed. Ref: ${bookingReference}`,
        type: 'booking'
      });

      // Broadcast real-time seat update via Socket.io if available
      const io = req.app.get('socketio');
      if (io) {
        io.to(`show_${showId}`).emit('seatsUpdated', {
          showId,
          bookedSeatIds: seatIds
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Booking confirmed successfully',
        data: {
          booking,
          transactionId
        }
      });
    } else {
      // Memory Store Fallback
      const show = await memoryStore.findById('shows', showId);
      if (!show) return res.status(404).json({ success: false, message: 'Show not found' });

      const movie = await memoryStore.findById('movies', show.movie);
      const theatre = await memoryStore.findById('theatres', show.theatre);

      const selectedSeats = [];
      for (const sId of seatIds) {
        const seatObj = (show.seats || []).find(s => s.seatId === sId);
        if (!seatObj) {
          return res.status(400).json({ success: false, message: `Seat ${sId} not found` });
        }
        if (seatObj.isBooked) {
          return res.status(400).json({ success: false, message: `Seat ${sId} is already booked!` });
        }
        selectedSeats.push(seatObj);
      }

      const totalAmount = selectedSeats.reduce((acc, s) => acc + s.price, 0);
      const convenienceFee = Math.round(totalAmount * 0.05);
      const taxAmount = Math.round((totalAmount + convenienceFee) * 0.18);
      const finalAmount = totalAmount + convenienceFee + taxAmount;

      const bookingReference = 'BK-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(2).toString('hex').toUpperCase();

      // Update seats in show
      const updatedSeats = show.seats.map(s => {
        if (seatIds.includes(s.seatId)) {
          return { ...s, isBooked: true, bookedBy: String(userId) };
        }
        return s;
      });
      await memoryStore.findByIdAndUpdate('shows', showId, { seats: updatedSeats });

      const booking = await memoryStore.create('bookings', {
        bookingReference,
        user: String(userId),
        show: showId,
        movie: movie ? { _id: movie._id, title: movie.title, posterUrl: movie.posterUrl } : show.movie,
        theatre: theatre ? { _id: theatre._id, name: theatre.name, city: theatre.city } : show.theatre,
        seats: selectedSeats.map(s => ({ seatId: s.seatId, tier: s.tier, price: s.price })),
        totalAmount,
        convenienceFee,
        taxAmount,
        finalAmount,
        paymentStatus: 'Paid',
        bookingStatus: 'Confirmed',
        showDate: show.showDate,
        showTime: show.showTime,
        paymentMethod
      });

      const transactionId = 'TXN-' + crypto.randomBytes(6).toString('hex').toUpperCase();
      await memoryStore.create('payments', {
        booking: booking._id,
        user: String(userId),
        transactionId,
        amount: finalAmount,
        method: paymentMethod,
        status: 'Success'
      });

      await memoryStore.create('notifications', {
        user: String(userId),
        title: 'Booking Confirmed!',
        message: `Tickets for ${movie ? movie.title : 'Movie'} on ${show.showDate} at ${show.showTime} confirmed. Ref: ${bookingReference}`,
        type: 'booking'
      });

      const io = req.app.get('socketio');
      if (io) {
        io.to(`show_${showId}`).emit('seatsUpdated', {
          showId,
          bookedSeatIds: seatIds
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Booking confirmed successfully',
        data: {
          booking,
          transactionId
        }
      });
    }
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ success: false, message: 'Server error processing booking' });
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
const getMyBookings = async (req, res) => {
  try {
    const userId = req.user._id;

    if (getIsConnected()) {
      const bookings = await Booking.find({ user: userId })
        .populate('movie', 'title posterUrl duration')
        .populate('theatre', 'name city address')
        .sort({ createdAt: -1 });

      return res.json({ success: true, count: bookings.length, data: bookings });
    } else {
      const all = await memoryStore.find('bookings');
      const userBookings = all.filter(b => String(b.user) === String(userId));
      userBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json({ success: true, count: userBookings.length, data: userBookings });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving bookings' });
  }
};

// @desc    Get single booking by ID or reference
// @route   GET /api/bookings/:id
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (getIsConnected()) {
      const booking = await Booking.findById(id)
        .populate('movie')
        .populate('theatre')
        .populate('user', 'name email phone');

      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
      return res.json({ success: true, data: booking });
    } else {
      const booking = await memoryStore.findById('bookings', id);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
      return res.json({ success: true, data: booking });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching booking' });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (getIsConnected()) {
      const booking = await Booking.findById(id);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

      if (String(booking.user) !== String(userId) && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
      }

      if (booking.bookingStatus === 'Cancelled') {
        return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
      }

      booking.bookingStatus = 'Cancelled';
      booking.paymentStatus = 'Refunded';
      await booking.save();

      // Free up seats in Show
      const show = await Show.findById(booking.show);
      if (show) {
        const seatIds = booking.seats.map(s => s.seatId);
        show.seats.forEach(s => {
          if (seatIds.includes(s.seatId)) {
            s.isBooked = false;
            s.bookedBy = null;
          }
        });
        await show.save();

        const io = req.app.get('socketio');
        if (io) {
          io.to(`show_${show._id}`).emit('seatsFreed', {
            showId: show._id,
            freedSeatIds: seatIds
          });
        }
      }

      await Notification.create({
        user: booking.user,
        title: 'Booking Cancelled',
        message: `Your booking #${booking.bookingReference} has been cancelled. Refund initiated.`,
        type: 'cancellation'
      });

      return res.json({ success: true, message: 'Booking cancelled successfully. Refund initiated.', data: booking });
    } else {
      const booking = await memoryStore.findById('bookings', id);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

      if (String(booking.user) !== String(userId) && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
      }

      const updated = await memoryStore.findByIdAndUpdate('bookings', id, {
        bookingStatus: 'Cancelled',
        paymentStatus: 'Refunded'
      });

      const show = await memoryStore.findById('shows', booking.show);
      if (show) {
        const seatIds = booking.seats.map(s => s.seatId);
        const updatedSeats = show.seats.map(s => {
          if (seatIds.includes(s.seatId)) {
            return { ...s, isBooked: false, bookedBy: null };
          }
          return s;
        });
        await memoryStore.findByIdAndUpdate('shows', show._id, { seats: updatedSeats });

        const io = req.app.get('socketio');
        if (io) {
          io.to(`show_${show._id}`).emit('seatsFreed', {
            showId: show._id,
            freedSeatIds: seatIds
          });
        }
      }

      await memoryStore.create('notifications', {
        user: String(booking.user),
        title: 'Booking Cancelled',
        message: `Your booking #${booking.bookingReference} has been cancelled. Refund initiated.`,
        type: 'cancellation'
      });

      return res.json({ success: true, message: 'Booking cancelled successfully. Refund initiated.', data: updated });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error cancelling booking' });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings/admin/all
const getAllBookingsAdmin = async (req, res) => {
  try {
    if (getIsConnected()) {
      const bookings = await Booking.find()
        .populate('user', 'name email phone')
        .populate('movie', 'title')
        .populate('theatre', 'name city')
        .sort({ createdAt: -1 });
      return res.json({ success: true, count: bookings.length, data: bookings });
    } else {
      const bookings = await memoryStore.find('bookings');
      return res.json({ success: true, count: bookings.length, data: bookings.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)) });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving all bookings' });
  }
};

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking, getAllBookingsAdmin };
