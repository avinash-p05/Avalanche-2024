const express = require('express');
const multer = require('multer')

const router = express.Router();
const { signup, login, verifyEmail, updateProfilePicture, bulkImportUsers,getUserById, searchUsers, advancedSearch, forgotPassword, resetPassword } = require('../controllers/authController');
const rateLimit = require('express-rate-limit');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/bulk-import', upload.single('file'), bulkImportUsers);
// Create a rate limiter
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again after 15 minutes'
// });

// // Apply the rate limiter to all auth routes
// router.use(authLimiter);

router.post('/signup', signup);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.put('/profile-picture/:userId', updateProfilePicture);
router.get('/user/:userId', getUserById);
router.get('/search', searchUsers);
router.get('/search/advanced', advancedSearch);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;