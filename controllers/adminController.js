// controllers/adminController.js
const Admin = require('../models/adminModel');
const jwt = require('jsonwebtoken');

// Secret key for JWT
const JWT_SECRET = 'AdMin123##';  // Use environment variables in a production setting

// Register Admin
const registerAdmin = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Admin already exists' });
        }

        // Create new admin
        const admin = new Admin({ username, email, password });
        await admin.save();

        res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Admin registration failed' });
    }
};

// Login Admin
const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        // Check password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ adminId: admin._id }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: 'Admin login failed' });
    }
};

// Get Admin Profile
const getAdminProfile = async (req, res) => {
    try {
        const adminId = req.adminId;
        const admin = await Admin.findById(adminId).select('-password');
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        res.json(admin);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch admin profile' });
    }
};

module.exports = { registerAdmin, loginAdmin, getAdminProfile };
