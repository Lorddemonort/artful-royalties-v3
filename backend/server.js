const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect('mongodb+srv://shafinshaikh25:shafin@cluster0.i6ub9mp.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Failed to connect to MongoDB", err);
});

// Authentication Middleware
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, 'shafin', (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// User Schema and Model
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    userType: String  // 'artist' or 'customer'
});

const User = mongoose.model('User', UserSchema);

// Signup Endpoint
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password, userType } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).send("User already exists");

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            userType
        });

        await newUser.save();

        res.status(201).send("User registered");
    } catch (error) {
        res.status(500).send("Server error");
    }
});

// Login Endpoint
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).send("Invalid email or password");

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).send("Invalid email or password");

        const token = jwt.sign({ userId: user._id }, 'shafin', { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).send("Server error");
    }
});

// Artwork Schema and Model
const ArtworkSchema = new mongoose.Schema({
    artistId: mongoose.Schema.Types.ObjectId,  // Reference to the artist's User document
    imageUrl: String,
    timesUsed: { type: Number, default: 0 }
});

const Artwork = mongoose.model('Artwork', ArtworkSchema);

// Stable Diffusion API Endpoint
app.post('/api/generate-art', async (req, res) => {
    // ... your existing code
});

// Multer Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

// Upload Artwork Endpoint
app.post('/api/upload-artwork', authenticateJWT, upload.single('artwork'), async (req, res) => {
    try {
        const artistId = req.user.userId; // Assuming you have middleware to set req.user
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        const newArtwork = new Artwork({
            artistId: artistId,
            imageUrl: imageUrl,
            timesUsed: 0
        });

        await newArtwork.save();

        res.json({ success: true, artwork: newArtwork });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Get Artworks Endpoint
app.get('/api/get-artworks', authenticateJWT, async (req, res) => {
    try {
        const artistId = req.user.userId; // Or however you retrieve it from the token

        const artworks = await Artwork.find({ artistId: artistId });
        res.json({ success: true, artworks: artworks });
    } catch (error) {
        console.error("Error fetching artworks:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
