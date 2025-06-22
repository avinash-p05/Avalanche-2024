// routes/adminRoutes.js
const express = require('express');
const { registerAdmin, loginAdmin, getAdminProfile } = require('../controllers/adminController');


const router = express.Router();

// Admin registration
router.post('/register', registerAdmin);

// Admin login
router.post('/login', loginAdmin);

// Get admin profile (protected route)
router.get('/profile', getAdminProfile);

module.exports = router;
