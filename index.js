const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(express.json());
app.use(cors())
require('dotenv').config()
const rateLimit = require('express-rate-limit');
const connectToMongo = require('./config/db');
const deleteUnverifiedUsers = require('./services/deleteUnverifiedUsers');
const port = process.env.PORT;
connectToMongo();
deleteUnverifiedUsers();
// Trust proxy configuration - Add this before setting up rate limiter
app.set('trust proxy', 1);

// Rate limiter configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    // Custom key generator that uses direct IP if X-Forwarded-For is not trusted
    keyGenerator: (req) => {
        if (req.ip) {
            return req.ip;
        }
        return req.connection.remoteAddress;
    }
});

// Apply rate limiting to all routes
app.use(limiter);

// Serve the uploads folder as a static directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from the 'static' folder (for frontend)
app.use(express.static(path.join(__dirname, 'static')));

// API routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/team', require('./routes/team'));
app.use('/api/v1/paper', require('./routes/paperRoute'));
app.use('/api/v1/admin',require('./routes/adminRoute'));
app.use('/api/v1/event',require('./routes/eventRoute'));
app.use('/api/v1/analytics',require('./routes/analyticsRoute'));

// API health check
app.get('/api',(req,res)=>{
    return res.status(200).json({
    message:"Backend is running"
    })
});

// Serve index.html for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Frontend available at: http://localhost:${port}`);
    console.log(`API available at: http://localhost:${port}/api`);
});