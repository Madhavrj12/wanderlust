const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware');
const paymentController = require('../controllers/payments');

// Show payment page
router.get('/:bookingId', isLoggedIn, paymentController.showPaymentPage);

// Process payment
router.post('/process/:bookingId', isLoggedIn, paymentController.processPayment);

module.exports = router; 