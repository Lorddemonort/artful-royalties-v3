const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

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
