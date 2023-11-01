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
                console.error("JWT Verification Error:", err);
                return res.sendStatus(403);
            }

            console.log("JWT Decoded User:", user);
            req.user = user;
            next();
        });
    } else {
        console.error("No Auth Header");
        res.sendStatus(401);
    }
};

// User Schema and Model
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    userType: String, // 'artist' or 'customer'
    tokenBalance: { type: Number, default: 100 },
    styleDescription: String // Added this line
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
            userType,
            tokenBalance: 100,
            styleDescription: req.body.styleDescription
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
app.post('/api/generate-art', authenticateJWT, async (req, res) => {
    const { textPrompts, artistId } = req.body;
    const customerId = req.user.userId;
    const tokenCost = 10; // Define a fixed token cost for the artwork
    const apiUrl = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image";
    const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer sk-vxMJbaPqTIy61FC1FxUgrEmvFgVkZzb1BQXJloKOEnT1g5f1"
    };

    console.log("Received artistId:", artistId); // Debug log
    console.log("Decoded customerId from JWT:", customerId); // Debug log

    const body = {
        steps: 40,
        width: 1024,
        height: 1024,
        seed: 0,
        cfg_scale: 5,
        samples: 1,
        text_prompts: [{ "text": textPrompts, "weight": 1 }]
    };

    try {
        const response = await fetch(apiUrl, {
            headers,
            method: "POST",
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`Non-200 response: ${await response.text()}`);
        }

        const responseJSON = await response.json();

        // Save images and send back URLs
        const imageUrls = responseJSON.artifacts.map((image, index) => {
            const imagePath = path.join('uploads', `txt2img_${image.seed}.png`);
            fs.writeFileSync(imagePath, Buffer.from(image.base64, 'base64'));
            return `${req.protocol}://${req.get('host')}/uploads/txt2img_${image.seed}.png`;
        });

        // Deduct tokens from customer and credit to artist
        const customer = await User.findById(customerId);
        const artist = await User.findById(artistId);

        if (!customer || !artist) {
            throw new Error("User not found");
        }

        if (!customer) {
            console.error("Customer not found with ID:", customerId); // Debug log
            return res.status(404).json({ success: false, message: "Customer not found" });
        }
    
        if (!artist) {
            console.error("Artist not found with ID:", artistId); // Debug log
            return res.status(404).json({ success: false, message: "Artist not found" });
        }

        customer.tokenBalance -= tokenCost;
        artist.tokenBalance += tokenCost;

        await customer.save();
        await artist.save();

        res.json({ success: true, images: imageUrls });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
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
        const artistId = req.user.userId;
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

// Get Artists Endpoint
app.get('/api/get-artists', authenticateJWT, async (req, res) => {
    try {
        const artists = await User.find({ userType: 'artist' });

        const artistData = await Promise.all(artists.map(async (artist) => {
            const artworks = await Artwork.find({ artistId: artist._id }).limit(5);
            return {
                name: artist.name,
                _id: artist._id, // Include this line to add the _id field
                imageUrl: artworks.length > 0 ? artworks[0].imageUrl : '',
                artworks: artworks,
                styleDescription: artist.styleDescription // Add this line
            };
        }));

        res.json({ success: true, artists: artistData });
    } catch (error) {
        console.error("Error fetching artists:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Add an endpoint for artists to update their style description
app.put('/api/update-style', authenticateJWT, async (req, res) => {
    const { styleDescription } = req.body;
    const artistId = req.user.userId;

    try {
        const artist = await User.findById(artistId);
        if (!artist) return res.status(404).send("Artist not found");

        artist.styleDescription = styleDescription;
        await artist.save();

        res.json({ success: true, message: "Style description updated" });
    } catch (error) {
        console.error("Update style description error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});