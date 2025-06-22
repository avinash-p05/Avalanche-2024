// controllers/auth_controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user_model');
const { sendVerificationEmail, sendWelcomeEmail ,sendLoginCredentialsEmail } = require('../services/emailService');
const JWT_SECRET = process.env.JWT_SECRET;
const { validateCollegeEmail } = require('../utils/validators');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer')
const { parse } = require('csv-parse');
const fs = require('fs');
const { Readable } = require('stream');
const axios = require('axios');
// Set up Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/ProfilePicture');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Initialize Multer with the storage configuration
const upload = multer({ storage });

const signup = async (req, res) => {
  const { username, email, password, registrationType, usn, captchaToken } = req.body;
  
  try {
      // Input validation
      const validationErrors = [];
      
      if (!username?.trim() || username.length < 3) {
          validationErrors.push('Username must be at least 3 characters long');
      }
      
      if (!email || typeof email !== 'string') {
          validationErrors.push('Invalid email format');
      }
      
      if (!password || password.length < 8) {
          validationErrors.push('Password must be at least 8 characters long');
      }
      
      if (!usn?.trim()) {
          validationErrors.push('USN is required');
      }
      
      if (!registrationType || !['individual', 'team'].includes(registrationType)) {
          validationErrors.push('Invalid registration type');
      }
      
      if (validationErrors.length > 0) {
          return res.status(400).json({
              error: 'Validation failed',
              details: validationErrors
          });
      }

      // Verify CAPTCHA
      try {
          const captchaResponse = await axios.post(
              'https://www.google.com/recaptcha/api/siteverify',
              null,
              {
                  params: {
                      secret: process.env.RECAPTCHA_SECRET_KEY,
                      response: captchaToken
                  }
              }
          );

          if (!captchaResponse.data.success) {
              return res.status(400).json({
                  error: 'CAPTCHA verification failed',
                  message: 'Please complete the CAPTCHA verification'
              });
          }
      } catch (captchaError) {
          console.error('CAPTCHA verification error:', captchaError);
          return res.status(500).json({
              error: 'CAPTCHA verification failed',
              message: 'Unable to verify CAPTCHA. Please try again.'
          });
      }

      // Normalize email
      const normalizedEmail = email.toLowerCase();

      // Validate college email
      if (!validateCollegeEmail(normalizedEmail)) {
          return res.status(400).json({
              error: 'Invalid email domain',
              message: 'Please use your college email address (@students.git.edu)'
          });
      }

      // Check existing email and USN
      const [existingEmail, existingUSN] = await Promise.all([
          User.findOne({ email: normalizedEmail }),
          User.findOne({ usn: usn.toUpperCase() })
      ]);

      if (existingEmail) {
          return res.status(400).json({
              error: 'Email already registered',
              message: 'This email address is already registered'
          });
      }

      if (existingUSN) {
          return res.status(400).json({
              error: 'USN already registered',
              message: 'This USN is already registered'
          });
      }

      // Generate verification token and hash password
      const [verificationToken, hashedPassword] = await Promise.all([
          crypto.randomBytes(32).toString('hex'),
          bcrypt.hash(password, 10)
      ]);

      // Create new user without payment details
      const user = new User({
          username: username.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          registrationType,
          usn: usn.toUpperCase(),
          verificationToken,
          isVerified: false,
          profilePicture: req.file ? req.file.filename : null,
          registeredAt: new Date(),
          lastLogin: null,
          // Initialize with default payment status
          paymentStatus: 'pending',
          // Don't set paymentDetails initially
      });

      // Save user and send verification email concurrently
      await Promise.all([
          user.save(),
          sendVerificationEmail(normalizedEmail, verificationToken)
              .catch(emailError => {
                  console.error('Verification email sending failed:', emailError);
                  // Continue with registration even if email fails
              })
      ]);

      // Log successful registration
      console.log(`New user registered: ${user._id} (${normalizedEmail})`);

      res.status(201).json({
          message: 'Registration successful. Please check your college email to verify your account.',
          userId: user._id,
          username: user.username,
          email: user.email
      });

  } catch (error) {
      console.error('Signup error:', error);
      
      // Handle specific MongoDB errors
      if (error.code === 11000) {
          const field = Object.keys(error.keyPattern)[0];
          return res.status(400).json({
              error: 'Duplicate entry',
              message: `This ${field} is already registered`
          });
      }

      res.status(500).json({
          error: 'Registration failed',
          message: process.env.NODE_ENV === 'development' 
              ? error.message 
              : 'An error occurred during registration'
      });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }
    
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    
    // Send welcome email
    await sendWelcomeEmail(user.email);
    
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
};




const login = async (req, res) => {
  const { email, password, captchaToken } = req.body;
  
  try {
    // Verify CAPTCHA first
    const captchaResponse = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: captchaToken
        }
      }
    );

    if (!captchaResponse.data.success) {
      return res.status(400).json({ 
        error: 'CAPTCHA verification failed' 
      });
    }

    // Proceed with user authentication
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your email first' });
    }
    
    const token = jwt.sign({ 
      userId: user._id,
      registrationType: user.registrationType 
    }, JWT_SECRET);
    
    res.json({ 
      token, 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        registrationType: user.registrationType,
        paymentStatus: user.paymentStatus
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: error.response?.data?.error || 'Login failed' 
    });
  }
};

const updateProfilePicture = [
  upload.single('profilePicture'), // Multer middleware to handle the file upload
  async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update the profilePicture field in the user model
      user.profilePicture = req.file ? req.file.filename : null;
      await user.save();

      res.json({ message: 'Profile picture updated successfully', user });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update profile picture' });
    }
  }
];

const getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

const searchUsers = async (req, res) => {
    try {
        const { query } = req.query; // Get the search query from URL parameters
        
        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                error: 'Search query must be at least 2 characters long'
            });
        }

        // Create a search regex that's case insensitive
        const searchRegex = new RegExp(query, 'i');

        // Search users with completed payments who match any of the search criteria
        const users = await User.find({
            $and: [
                // Only include users with completed payments
                { paymentStatus: { $in: ['completed', 'received'] } },
                // Search across multiple fields
                {
                    $or: [
                        { username: searchRegex },
                        { email: searchRegex },
                        { usn: searchRegex }
                    ]
                }
            ]
        })
        .select('-password -verificationToken') // Exclude sensitive fields
        .limit(10) // Limit results to prevent overwhelming response
        .sort({ username: 1 }); // Sort results alphabetically

        // Format the response
        const formattedUsers = users.map(user => ({
            id: user._id,
            username: user.username,
            email: user.email,
            usn: user.usn,
            paymentStatus: user.paymentStatus,
            registrationType: user.registrationType,
            events: user.events.length,
            profilePicture: user.profilePicture || null
        }));

        // Return the results with metadata
        res.json({
            count: formattedUsers.length,
            query: query,
            users: formattedUsers
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            error: 'Failed to perform search',
            details: error.message
        });
    }
};

// Advanced search with pagination and filters
const advancedSearch = async (req, res) => {
    try {
        const {
            query,
            page = 1,
            limit = 10,
            registrationType,
            sortBy = 'username',
            sortOrder = 'asc'
        } = req.query;

        // Validate page and limit
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        
        if (pageNum < 1 || limitNum < 1) {
            return res.status(400).json({
                error: 'Invalid pagination parameters'
            });
        }

        // Build search criteria
        const searchCriteria = {
            paymentStatus: { $in: ['completed', 'received'] }
        };

        // Add search query if provided
        if (query && query.trim().length >= 2) {
            const searchRegex = new RegExp(query.trim(), 'i');
            searchCriteria.$or = [
                { username: searchRegex },
                { email: searchRegex },
                { usn: searchRegex }
            ];
        }

        // Add registration type filter if provided
        if (registrationType) {
            searchCriteria.registrationType = registrationType;
        }

        // Build sort object
        const sortObject = {};
        sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute search with pagination
        const totalUsers = await User.countDocuments(searchCriteria);
        const totalPages = Math.ceil(totalUsers / limitNum);

        const users = await User.find(searchCriteria)
            .select('-password -verificationToken')
            .sort(sortObject)
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

        // Format the response
        const formattedUsers = users.map(user => ({
            id: user._id,
            username: user.username,
            email: user.email,
            usn: user.usn,
            paymentStatus: user.paymentStatus,
            registrationType: user.registrationType,
            events: user.events.length,
            profilePicture: user.profilePicture || null,
            teamIds: user.teamIds
        }));

        res.json({
            metadata: {
                total: totalUsers,
                page: pageNum,
                totalPages,
                limit: limitNum,
                query: query || null,
                registrationType: registrationType || null
            },
            users: formattedUsers
        });

    } catch (error) {
        console.error('Advanced search error:', error);
        res.status(500).json({
            error: 'Failed to perform advanced search',
            details: error.message
        });
    }
};


// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.SMTP_EMIAL, 
    pass: process.env.SMTP_PASS, 
  },
});

// Reuse the base style from your email service
const getBaseStyle = () => `
  <style>
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
      
      body {
          background-color: #000915;
          color: #E0F2FF;
          font-family: 'Orbitron', sans-serif;
          margin: 0;
          padding: 20px;
      }
      .container {
          max-width: 600px;
          margin: 0 auto;
          background: linear-gradient(135deg, #001B3D 0%, #000915 100%);
          border: 2px solid #00A3FF;
          padding: 20px;
          box-shadow: 0 0 30px rgba(0, 163, 255, 0.2);
          position: relative;
          overflow: hidden;
      }
      .container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00A3FF, transparent);
          animation: scan 2s linear infinite;
      }
      @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
      }
      .logo {
          text-align: center;
          margin-bottom: 30px;
      }
      .logo h1 {
          font-size: 36px;
          margin: 0;
          background: linear-gradient(90deg, #00A3FF, #00FFE0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: pulse 2s infinite;
      }
      @keyframes pulse {
          0% { text-shadow: 0 0 10px rgba(0, 163, 255, 0.5); }
          50% { text-shadow: 0 0 20px rgba(0, 163, 255, 0.8); }
          100% { text-shadow: 0 0 10px rgba(0, 163, 255, 0.5); }
      }
      .header {
          text-align: center;
          border-bottom: 2px solid #00A3FF;
          padding-bottom: 20px;
          margin-bottom: 20px;
          position: relative;
      }
      .content {
          padding: 20px;
          background: rgba(0, 27, 61, 0.5);
          border-radius: 5px;
          position: relative;
      }
      .content::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #00A3FF, transparent);
      }
      .otp-display {
          font-size: 32px;
          text-align: center;
          color: #00A3FF;
          margin: 20px 0;
          text-shadow: 0 0 10px rgba(0, 163, 255, 0.5);
          letter-spacing: 5px;
      }
      .status-box {
          border: 1px solid #00A3FF;
          padding: 15px;
          margin: 20px 0;
          background: rgba(0, 163, 255, 0.1);
          position: relative;
      }
      .progress-bar {
          width: 100%;
          height: 20px;
          background: #001B3D;
          border: 1px solid #00A3FF;
          margin: 20px 0;
          position: relative;
          overflow: hidden;
      }
      .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00A3FF, #00FFE0);
          width: 0;
          animation: fillProgress 1.5s ease-out forwards;
      }
      @keyframes fillProgress {
          from { width: 0; }
          to { width: 100%; }
      }
      .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #7FA8C7;
          border-top: 1px solid rgba(0, 163, 255, 0.3);
          padding-top: 20px;
      }
  </style>
`;

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email
const sendOTPEmail = async (to, otp) => {
  try {
      await transporter.sendMail({
          from: process.env.SMTP_EMAIL,
          to,
          subject: '❄️ Password Reset OTP - Avalanche 2024',
          html: `
              ${getBaseStyle()}
              <div class="container">
                  <div class="logo">
                      <h1>AVALANCHE 2024</h1>
                  </div>
                  <div class="header">
                      <h2>Password Reset Request</h2>
                  </div>
                  <div class="content">
                      <p>We received a request to reset your password. Here's your OTP:</p>
                      <div class="otp-display">${otp}</div>
                      <div class="status-box">
                          <p>OTP STATUS: ACTIVE</p>
                          <p>VALIDITY: 15 MINUTES</p>
                          <div class="progress-bar">
                              <div class="progress-fill"></div>
                          </div>
                      </div>
                      <p>This OTP will expire in 15 minutes for security purposes.</p>
                      <p>If you didn't request this password reset, please ignore this email or contact support if you're concerned.</p>
                  </div>
                  <div class="footer">
                      <p>AVALANCHE 2024 • SECURE PASSWORD RESET SYSTEM</p>
                  </div>
              </div>
          `
      });
      console.log('OTP email sent successfully');
  } catch (error) {
      console.error('Failed to send OTP email:', error);
      throw error;
  }
};

// Send Password Reset Confirmation Email
const sendPasswordResetConfirmationEmail = async (to) => {
  try {
      await transporter.sendMail({
          from: process.env.SMTP_EMAIL,
          to,
          subject: '❄️ Password Reset Successful - Avalanche 2024',
          html: `
              ${getBaseStyle()}
              <div class="container">
                  <div class="logo">
                      <h1>AVALANCHE 2024</h1>
                  </div>
                  <div class="header">
                      <h2>Password Reset Successful</h2>
                  </div>
                  <div class="content">
                      <p>Your password has been successfully reset!</p>
                      <div class="status-box">
                          <p>RESET STATUS: COMPLETE</p>
                          <p>ACCOUNT SECURITY: UPDATED</p>
                          <div class="progress-bar">
                              <div class="progress-fill"></div>
                          </div>
                      </div>
                      <p>You can now log in with your new password.</p>
                      <p>If you didn't make this change, please contact support immediately.</p>
                  </div>
                  <div class="footer">
                      <p>AVALANCHE 2024 • SECURE PASSWORD RESET SYSTEM</p>
                  </div>
              </div>
          `
      });
      console.log('Password reset confirmation email sent successfully');
  } catch (error) {
      console.error('Failed to send password reset confirmation email:', error);
  }
};

// Request Password Reset
const forgotPassword = async (req, res) => {
  try {
      const { email } = req.body;

      if (!email) {
          return res.status(400).json({
              error: 'Email is required',
              message: 'Please provide your email address'
          });
      }

      // Find user and validate email
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
          return res.status(404).json({
              error: 'User not found',
              message: 'No account found with this email address'
          });
      }

      // Generate OTP and set expiry (15 minutes from now)
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Update user with OTP details
      user.resetPasswordOTP = otp;
      user.resetPasswordOTPExpiry = otpExpiry;
      await user.save();

      // Send OTP email
      await sendOTPEmail(email, otp);

      res.json({
          message: 'OTP sent successfully to your email',
          validity: '15 minutes'
      });

  } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
          error: 'Failed to process password reset request',
          message: error.message
      });
  }
};

// Verify OTP and Reset Password
const resetPassword = async (req, res) => {
  try {
      const { email, otp, newPassword } = req.body;

      if (!email || !otp || !newPassword) {
          return res.status(400).json({
              error: 'Missing required fields',
              message: 'Please provide email, OTP, and new password'
          });
      }

      // Validate password
      if (newPassword.length < 8) {
          return res.status(400).json({
              error: 'Invalid password',
              message: 'Password must be at least 8 characters long'
          });
      }

      // Find user and validate OTP
      const user = await User.findOne({
          email: email.toLowerCase(),
          resetPasswordOTP: otp,
          resetPasswordOTPExpiry: { $gt: new Date() }
      });

      if (!user) {
          return res.status(400).json({
              error: 'Invalid or expired OTP',
              message: 'Please request a new OTP'
          });
      }

      // Hash new password and update user
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.resetPasswordOTP = null;
      user.resetPasswordOTPExpiry = null;
      await user.save();

      // Send confirmation email
      await sendPasswordResetConfirmationEmail(email);

      res.json({
          message: 'Password reset successful'
      });

  } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
          error: 'Failed to reset password',
          message: error.message
      });
  }
};


// Generate a random password of specified length
const generatePassword = (length = 8) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
};

// Process CSV data and create users
const processCSVData = async (fileBuffer) => {
    const results = [];
    
    // Create a readable stream from the buffer
    const bufferStream = Readable.from(fileBuffer.toString());

    const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
    });

    return new Promise((resolve, reject) => {
        bufferStream
            .pipe(parser)
            .on('data', (data) => results.push(data))
            .on('error', (error) => reject(error))
            .on('end', () => resolve(results));
    });
};

const bulkImportUsers = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            error: 'No file uploaded',
            message: 'Please upload a CSV file'
        });
    }

    try {
        // Process CSV data
        const users = await processCSVData(req.file.buffer);
        
        const results = {
            successful: [],
            failed: []
        };

        // Process each user
        for (const userData of users) {
            try {
                // Generate password
                const password = generatePassword(8);
                const hashedPassword = await bcrypt.hash(password, 10);

                // Create user object
                const user = new User({
                    username: userData.name, // Assuming CSV has 'name' column
                    email: userData.email,   // Assuming CSV has 'email' column
                    password: hashedPassword,
                    usn: userData.usn,       // Assuming CSV has 'usn' column
                    registrationType: userData.registrationType || 'individual',
                    isVerified: true,        // Set verified by default as requested
                    paymentStatus: 'pending'
                });

                // Save user
                await user.save();

                // Send login credentials email
                await sendLoginCredentialsEmail(
                    userData.email,
                    userData.name,
                    userData.usn,
                    password
                ).catch(error => {
                    console.error(`Failed to send email to ${userData.email}:`, error);
                });

                results.successful.push({
                    email: userData.email,
                    usn: userData.usn
                });

            } catch (error) {
                results.failed.push({
                    email: userData.email,
                    usn: userData.usn,
                    error: error.message
                });
            }
        }

        // Send response
        res.status(200).json({
            message: 'Bulk import completed',
            summary: {
                total: users.length,
                successful: results.successful.length,
                failed: results.failed.length
            },
            results
        });

    } catch (error) {
        console.error('Bulk import error:', error);
        res.status(500).json({
            error: 'Import failed',
            message: process.env.NODE_ENV === 'development' 
                ? error.message 
                : 'An error occurred during bulk import'
        });
    }
};

module.exports = { signup, login, verifyEmail, updateProfilePicture, getUserById ,advancedSearch,searchUsers,forgotPassword,
  resetPassword,bulkImportUsers};