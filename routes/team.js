const express = require('express');
const router = express.Router();
const { 
registerForEvent,
completePayment,
registerTeam,
verifyPayment,
getEventStats,
getStats,
getUserWithEvents,
filterResults
} = require('../controllers/teamController');
const authMiddleware = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');
// Create a rate limiter
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again after 15 minutes'
// });

// // Apply the rate limiter to all auth routes
// router.use(authLimiter);
// Apply auth middleware to all registration routes
// router.use(authMiddleware);

router.post('/register/event/:id', registerForEvent);
router.post('/payment/complete', completePayment);
router.post('/register/team', registerTeam);
router.post('/payment/verify', verifyPayment);
router.get('/events/:eventId/stats', getEventStats);
router.get('/events/stats',getStats)
router.get('/get-user-event/:userId',getUserWithEvents)
router.get('/filter',filterResults);

module.exports = router;