const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Sentiment = require('sentiment');
require('dotenv').config();

const app = express();
const sentiment = new Sentiment();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cardealership', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDB connection established successfully');
});

// Define dealer schema
const dealerSchema = new mongoose.Schema({
    name: String,
    location: {
        state: String,
        city: String
    },
    address: String,
    reviews: [{
        user: String,
        rating: Number,
        comment: String,
        date: { type: Date, default: Date.now }
    }]
});

const Dealer = mongoose.model('Dealer', dealerSchema);

// Routes
// Get all dealers
app.get('/api/dealers', async (req, res) => {
    try {
        const dealers = await Dealer.find();
        res.json(dealers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get dealer details
app.get('/api/dealers/:id', async (req, res) => {
    try {
        const dealer = await Dealer.findById(req.params.id);
        res.json(dealer);
    } catch (err) {
        res.status(404).json({ message: 'Dealer not found' });
    }
});

// Get dealers by state
app.get('/api/dealers/state/:state', async (req, res) => {
    try {
        const dealers = await Dealer.find({ 'location.state': req.params.state });
        res.json(dealers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get dealer reviews
app.get('/api/dealers/:id/reviews', async (req, res) => {
    try {
        const dealer = await Dealer.findById(req.params.id);
        res.json(dealer.reviews);
    } catch (err) {
        res.status(404).json({ message: 'Dealer not found' });
    }
});

app.post('/api/dealers/:id/reviews', async (req, res) => {
    try {
        const { user, rating, comment } = req.body;
        const dealer = await Dealer.findById(req.params.id);

        if (!dealer) {
            return res.status(404).json({ message: 'Dealer not found' });
        }

        dealer.reviews.push({ user, rating, comment });
        await dealer.save();

        res.json(dealer.reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/analyze-sentiment', (req, res) => {
    // Your sentiment analyzer code...
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const analysis = sentiment.analyze(text);
        let result = {
            score: analysis.score,
            comparative: analysis.comparative,
            calculation: analysis.calculation,
            tokens: analysis.tokens,
            positive: analysis.positive,
            negative: analysis.negative
        };

        // Add a human-readable assessment
        let assessment;
        if (analysis.score > 0) {
            assessment = 'Positive';
        } else if (analysis.score < 0) {
            assessment = 'Negative';
        } else {
            assessment = 'Neutral';
        }

        result.assessment = assessment;

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error analyzing sentiment' });
    }
});

// Add some sample data
async function addSampleData() {
    try {
        // Force clear all dealers
        await Dealer.deleteMany({});
        console.log('Cleared existing dealers');

        const result = await Dealer.create([
                {
                    name: "Kansas City Motors",
                    location: {
                        state: "Kansas",
                        city: "Kansas City"
                    },
                    address: "123 Auto Drive",
                    reviews: [
                        {
                            user: "John Doe",
                            rating: 5,
                            comment: "Great service and friendly staff!"
                        },
                        {
                            user: "Sarah Wilson",
                            rating: 4,
                            comment: "Good selection of cars, slightly pricey"
                        }
                    ]
                },
                {
                    name: "Topeka Premium Cars",
                    location: {
                        state: "Kansas",
                        city: "Topeka"
                    },
                    address: "456 Car Street",
                    reviews: [
                        {
                            user: "Jane Smith",
                            rating: 4,
                            comment: "Professional dealership experience"
                        },
                        {
                            user: "Mike Johnson",
                            rating: 5,
                            comment: "Best prices in town!"
                        }
                    ]
                },
                {
                    name: "California Dream Cars",
                    location: {
                        state: "California",
                        city: "Los Angeles"
                    },
                    address: "789 Sunset Boulevard",
                    reviews: [
                        {
                            user: "Tom Brown",
                            rating: 5,
                            comment: "Excellent luxury car selection"
                        },
                        {
                            user: "Emily Davis",
                            rating: 3,
                            comment: "Good cars but long waiting times"
                        }
                    ]
                },
                {
                    name: "Bay Area Motors",
                    location: {
                        state: "California",
                        city: "San Francisco"
                    },
                    address: "321 Tech Road",
                    reviews: [
                        {
                            user: "David Chen",
                            rating: 5,
                            comment: "Amazing electric vehicle inventory"
                        }
                    ]
                },
                {
                    name: "Texas Grand Autos",
                    location: {
                        state: "Texas",
                        city: "Houston"
                    },
                    address: "555 Rodeo Drive",
                    reviews: [
                        {
                            user: "James Wilson",
                            rating: 4,
                            comment: "Great truck selection"
                        },
                        {
                            user: "Maria Garcia",
                            rating: 5,
                            comment: "Fantastic customer service!"
                        },
                        {
                            user: "Robert Taylor",
                            rating: 4,
                            comment: "Fair prices and good maintenance service"
                        }
                    ]
                },
                {
                    name: "Dallas Premium Vehicles",
                    location: {
                        state: "Texas",
                        city: "Dallas"
                    },
                    address: "777 Cowboy Lane",
                    reviews: [
                        {
                            user: "Lisa Anderson",
                            rating: 5,
                            comment: "Outstanding luxury car experience"
                        },
                        {
                            user: "Kevin Martinez",
                            rating: 4,
                            comment: "Good selection of both new and used cars"
                        }
                    ]
                },
                {
                    name: "Wichita Auto Gallery",
                    location: {
                        state: "Kansas",
                        city: "Wichita"
                    },
                    address: "999 Central Avenue",
                    reviews: [
                        {
                            user: "Chris Thompson",
                            rating: 4,
                            comment: "Honest dealers and fair prices"
                        },
                        {
                            user: "Amanda White",
                            rating: 5,
                            comment: "Best dealership experience in Kansas!"
                        },
                        {
                            user: "Daniel Lee",
                            rating: 4,
                            comment: "Great selection of family cars"
                        }
                    ]
                }
            ]);
        console.log(`Successfully added ${result.length} dealers`);
    } catch (err) {
        console.error('Error adding sample data:', err);
    }
}

// Start server
const port = process.env.PORT || 5001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    addSampleData();
});