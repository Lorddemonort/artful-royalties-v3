const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const path = require('path');

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


//continue for authentication code

// Continue in server.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    userType: String  // 'artist' or 'customer'
});

const User = mongoose.model('User', UserSchema);

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


//configure mongodb for upload of files like images
const ArtworkSchema = new mongoose.Schema({
    artistId: mongoose.Schema.Types.ObjectId,  // Reference to the artist's User document
    imageUrl: String,
    timesUsed: { type: Number, default: 0 }
});

const Artwork = mongoose.model('Artwork', ArtworkSchema);

//Stable Diffussion API from stability.ai to generate ai art
app.post('/api/generate-art', async (req, res) => {
    const { textPrompts } = req.body;
    const apiUrl = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image";
    const headers = {
        Accept: "application/json",
        "Content-Type": "application/json", // Added this line to solve issue of header structure
        Authorization: "Bearer sk-vxMJbaPqTIy61FC1FxUgrEmvFgVkZzb1BQXJloKOEnT1g5f1"
    };

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

        res.json({ success: true, images: imageUrls });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});