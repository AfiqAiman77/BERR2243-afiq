const express = require('express');
const router = express.Router();
const Ride = require('../models/ride');

// Book a ride route
router.post('/book', async (req, res) => {
  try {
    const { passengerId, startLocation, endLocation } = req.body;

    const newRide = new Ride({
      passengerId,
      startLocation,
      endLocation,
      status: 'pending'
    });

    const savedRide = await newRide.save();
    res.status(201).json(savedRide);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
