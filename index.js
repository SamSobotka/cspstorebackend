const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const dbURL = process.env.MONGODB_URL || 'mongodb://localhost:27017/';
const PORT = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(cors());

mongoose.connect(dbURL, {
    dbName: 'cspstoredb',
}).then(() => console.log('Connected to database')).catch(err => console.error(err));

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now()
    }
});
const User = mongoose.model('User', userSchema);

app.get("/", (req, res) => {
    res.send("Backend active");
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user._id }, 'flw292n2JBK897j23kKUHjk3k2H98hH985d6rc', { expiresIn: '1d' });

        res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const {firstName, lastName, email, password} = req.body;

        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({message: 'Email already registered'});
        }

        if (!email) {
            return res.status(400).json({message: 'Email is required'});
        }

        const newUser = new User({firstName, lastName, email, password});
        await newUser.save();

        res.status(201).json({message: 'User registered successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: `Server error: ${err}`});
    }
});

app.post('/api/delete', async (req, res) => {
    try {
        const {email} = req.body;

        const existingUser = await User.findOne({email});
        if (!existingUser) {
            return res.status(400).json({message: 'User not found'});
        }

        User.deleteOne({email}).then(() => console.log('User deleted successfully')).catch(err => console.error(err));

        res.status(200).json({message: 'User deleted successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: `Server error: ${err}`});
    }
});

app.listen(PORT, () => {
    console.log(`Listening at port ${PORT}`);
});

module.exports = app;