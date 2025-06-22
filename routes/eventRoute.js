const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Event = require('../models/eventModel'); // Import the Event schema

const router = express.Router();
const rateLimit = require('express-rate-limit');
// Create a rate limiter
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again after 15 minutes'
// });

// // Apply the rate limiter to all auth routes
// router.use(authLimiter);

// Configure multer for file upload
const upload = multer({ dest: 'uploads/' });

// Route to handle JSON file upload and import
router.post('/import-events', upload.single('file'), async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read and parse the JSON file
    const filePath = path.join(__dirname, '..', req.file.path);
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Validate JSON data format
    if (!Array.isArray(jsonData)) {
      // Remove the uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'JSON file must contain an array of events' });
    }

    // Save each event to MongoDB
    const savedEvents = [];
    const failedEvents = [];
    for (const eventData of jsonData) {
      try {
        // Validate the event data
        const event = new Event(eventData);
        await event.validate();

        // Save the event
        const savedEvent = await event.save();
        savedEvents.push(savedEvent);
      } catch (error) {
        // Handle validation errors
        console.error('Error saving event:', error);
        failedEvents.push({ eventData, error: error.message });
      }
    }

    // Remove the uploaded file after processing
    fs.unlinkSync(filePath);

    // Send response with saved and failed events
    res.status(200).json({
      message: 'Events imported successfully',
      savedEvents,
      failedEvents
    });
  } catch (error) {
    console.error('Error importing events:', error);
    res.status(500).json({ error: 'An error occurred while importing events' });
  }
});

module.exports = router;