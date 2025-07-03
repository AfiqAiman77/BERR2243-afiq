const express = require('express');
const router = express.Router();
const Payment = require('../models/payment');
const Ride = require('../models/ride');

// Make a payment route
router.post('/pay', async (req, res) => {
  try {
    const { rideId, passengerId, amount, paymentMethod } = req.body;

    // Check if the ride exists and is completed
    const ride = await Ride.findById(rideId);
    if (!ride || ride.status !== 'completed') {
      return res.status(400).json({ error: 'Ride not completed yet.' });
    }

    // Create the payment
    const payment = new Payment({
      rideId,
      passengerId,
      amount,
      paymentMethod
    });

    const savedPayment = await payment.save();

    // Update the ride status to "paid"
    ride.status = 'paid';
    await ride.save();

    res.status(201).json(savedPayment);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
