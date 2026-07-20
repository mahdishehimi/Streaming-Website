const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./db');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const mediaRoutes = require('./routes/media');
const favoriteRoutes = require('./routes/favorite');

app.use(express.json());
app.use(cors());

// Routes
app.use('/auth', authRoutes);        
app.use('/media', mediaRoutes);     
app.use('/favorites', favoriteRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));
