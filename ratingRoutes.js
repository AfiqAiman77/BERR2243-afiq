const express = require('express');
const router = express.Router();
const Rating = require('../models/rating');
const Ride = require('../models/ride');

// Rate a ride
router.post('/rate', async (req, res) => {
  try {
    const { rideId, userId, rating, review } = req.body;

    // Check if ride exists and is completed
    const ride = await Ride.findById(rideId);
    if (!ride || ride.status !== 'completed') {
      return res.status(400).json({ error: 'Ride must be completed to rate.' });
    }

    const newRating = new Rating({
      rideId,
      userId,
      rating,
      review
    });

    const savedRating = await newRating.save();
    res.status(201).json(savedRating);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
