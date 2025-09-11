const mongoose = require('mongoose');

// Add "paid" status to the enum
const rideSchema = new mongoose.Schema({
  passengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startLocation: { 
    type: { type: String, enum: ['Point'], required: true }, 
    coordinates: [Number] 
  },
  endLocation: { 
    type: { type: String, enum: ['Point'], required: true }, 
    coordinates: [Number] 
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'completed', 'cancelled', 'paid'],  // Added 'paid' here
    default: 'pending' 
  },
  rideStartTime: { type: Date },
  rideEndTime: { type: Date },
  fare: { type: Number }
});

// Index for geospatial queries
rideSchema.index({ startLocation: '2dsphere' });
rideSchema.index({ endLocation: '2dsphere' });

module.exports = mongoose.model('Ride', rideSchema);
