const Booking = require('../models/booking');
const Listing = require('../models/listing');

module.exports.showPaymentPage = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId)
            .populate('listing')
            .populate('user');

        if (!booking) {
            req.flash('error', 'Booking not found');
            return res.redirect('/listings');
        }

        // Check if the booking belongs to the current user
        if (!booking.user._id.equals(req.user._id)) {
            req.flash('error', 'You are not authorized to view this booking');
            return res.redirect('/listings');
        }

        // Check if the booking is already paid
        if (booking.status === 'paid') {
            req.flash('error', 'This booking has already been paid');
            return res.redirect('/listings');
        }

        res.render('payments/payment', { booking, listing: booking.listing });
    } catch (error) {
        console.error('Error showing payment page:', error);
        req.flash('error', 'Something went wrong');
        res.redirect('/listings');
    }
};

module.exports.processPayment = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            req.flash('error', 'Booking not found');
            return res.redirect('/listings');
        }

        // Check if the booking belongs to the current user
        if (!booking.user.equals(req.user._id)) {
            req.flash('error', 'You are not authorized to process this payment');
            return res.redirect('/listings');
        }

        // Check if the booking is already paid
        if (booking.status === 'paid') {
            req.flash('error', 'This booking has already been paid');
            return res.redirect('/listings');
        }

        // Here you would typically integrate with a payment gateway
        // For now, we'll just mark the booking as paid
        booking.status = 'paid';
        await booking.save();

        req.flash('success', 'Payment successful! Your booking is confirmed.');
        res.redirect(`/bookings/${booking._id}`);
    } catch (error) {
        console.error('Error processing payment:', error);
        req.flash('error', 'Payment failed. Please try again.');
        res.redirect(`/payments/${bookingId}`);
    }
}; 