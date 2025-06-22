require('dotenv').config();  // Import environment variables from .env file
const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');  // Import ObjectId from MongoDB
const jwt = require('jsonwebtoken');  // Import jsonwebtoken

// Initialize Express
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// MongoDB connection setup (Replace with your MongoDB URI)
const uri = "mongodb://localhost:27017"; // MongoDB connection string
let db;  // Variable to hold the database connection

// Connect to MongoDB
MongoClient.connect(uri)
    .then(client => {
        db = client.db('e-hailing');
        console.log('Connected to Database');
    })
    .catch(error => console.error(error));

// Middleware to authenticate the user by checking JWT token
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];  // Extract token from Authorization header
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verify the token
        req.user = decoded;  // Attach the decoded token (user info) to the request
        next();  // Proceed to the next middleware/route
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};

// Middleware to authorize the user based on their role
const authorize = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {  // Check if the user's role is in the allowed list
        return res.status(403).json({ error: "Forbidden" });
    }
    next();  // Proceed to the next middleware/route
};

// POST /users - User registration (Password Hashing)
const saltRounds = 10;

app.post('/users', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = { email, password: hashedPassword, role };

        await db.collection('users').insertOne(user);
        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        res.status(400).json({ error: "Registration failed", details: err.message });
    }
});

// POST /auth/login - User login and JWT generation
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        // Check if the user exists in the database
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Compare the password with the hashed password stored in the database
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate a JWT token if credentials are valid
        const token = jwt.sign(
            { userId: user._id, role: user.role },  // Payload
            process.env.JWT_SECRET,  // Secret key from .env
            { expiresIn: process.env.JWT_EXPIRES_IN }  // Expiration time from .env
        );

        // Return the token to the client
        res.status(200).json({ token });
    } catch (err) {
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

// DELETE /admin/users/:id - Admin can delete a user
app.delete('/admin/users/:id', authenticate, authorize(['admin']), async (req, res) => {
    const userId = req.params.id;  // The ID from the route parameter

    try {
        // Convert the ID to MongoDB ObjectId
        const objectId = new ObjectId(userId);  // Convert the string ID to a MongoDB ObjectId

        // Delete the user by ObjectId
        const result = await db.collection('users').deleteOne({ _id: objectId });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
