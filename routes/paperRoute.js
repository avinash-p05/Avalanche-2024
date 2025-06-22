const express = require('express');
const router = express.Router();
const {
    createPaper,
    getAllPapers,
    getPaperById,
    updatePaperStatus,
    filterPapers
} = require('../controllers/paperController');
const upload = require('../middleware/upload');
const rateLimit = require('express-rate-limit');
// Create a rate limiter
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again after 15 minutes'
// });

// // Apply the rate limiter to all auth routes
// router.use(authLimiter);
// Create a new paper presentation
router.post('/papers', upload.single('paperFile'), createPaper);

// Get all paper presentations (for admin)
router.get('/papers', getAllPapers);

// Get a specific paper presentation (for admin)
router.get('/papers/:id', getPaperById);

// Update a paper presentation (for admin)
router.patch('/papers/:id', updatePaperStatus);

// Filter paper presentations (for admin)
router.get('/papers/filter', filterPapers);

module.exports = router;