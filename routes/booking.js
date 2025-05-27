const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware');
const Booking = require('../models/booking');
const wrapAsync = require('../utils/wrapAsync');

// Show all bookings for the current user
router.get('/', isLoggedIn, wrapAsync(async (req, res) => {
    const bookings = await Booking.find({ 
        user: req.user._id,
        status: { $ne: 'cancelled' } // Exclude cancelled bookings
    })
        .populate('listing')
        .sort({ createdAt: -1 });
    res.render('bookings/index', { bookings });
}));

// Show a specific booking
router.get('/:id', isLoggedIn, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const booking = await Booking.findById(id)
        .populate('listing')
        .populate('user');

    if (!booking) {
        req.flash('error', 'Booking not found');
        return res.redirect('/bookings');
    }

    // Check if the booking belongs to the current user
    if (!booking.user._id.equals(req.user._id)) {
        req.flash('error', 'You are not authorized to view this booking');
        return res.redirect('/bookings');
    }

    res.render('bookings/show', { booking });
}));

// Cancel a booking
router.post('/:id/cancel', isLoggedIn, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
        req.flash('error', 'Booking not found');
        return res.redirect('/bookings');
    }

    // Check if the booking belongs to the current user
    if (!booking.user.equals(req.user._id)) {
        req.flash('error', 'You are not authorized to cancel this booking');
        return res.redirect('/bookings');
    }

    // Check if the booking is pending
    if (booking.status !== 'pending') {
        req.flash('error', 'Only pending bookings can be cancelled');
        return res.redirect(`/bookings/${id}`);
    }

    // Update booking status to cancelled using findByIdAndUpdate
    await Booking.findByIdAndUpdate(id, { status: 'cancelled' }, { runValidators: true });

    req.flash('success', 'Booking cancelled successfully');
    res.redirect(`/bookings/${id}`);
}));

module.exports = router; 