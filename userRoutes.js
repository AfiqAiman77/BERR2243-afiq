const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');

// Register route for creating new users
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, location } = req.body;

    console.log('Received data:', req.body);  // Log the incoming data for debugging

    // Hash the password before saving
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create a new user
    const newUser = new User({
      username,
      email,
      passwordHash,
      role,
      location
    });

    // Save the user to the database
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);

  } catch (err) {
    console.log('Error:', err.message);  // Log any error
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
