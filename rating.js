const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String }
});

module.exports = mongoose.model('Rating', ratingSchema);
