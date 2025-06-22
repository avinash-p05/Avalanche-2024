# Avalanche 2024 Backend

A comprehensive Node.js backend API for the Avalanche 2024 technical event management system built by KLS GIT Tech Team.

## 🚀 Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Email verification system
  - Password reset functionality
  - Rate limiting for security

- **Event Management**
  - Dynamic event registration
  - Team and individual participation
  - Registration limits and tracking
  - Event analytics and reporting

- **Team Management**
  - Team formation (2-4 members)
  - Team leader assignment
  - Payment tracking per team member

- **Paper Presentation System**
  - File upload support
  - Status tracking (Submitted/Accepted/Rejected)
  - Admin review and feedback system

- **Payment Integration**
  - Payment status tracking
  - Transaction ID management
  - Email confirmations

- **Admin Panel**
  - User management
  - Event analytics
  - Data export capabilities
  - Bulk user import

- **Analytics & Reporting**
  - Department-wise participation
  - Event-wise statistics
  - Payment details export
  - Excel/CSV data export

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Email Service**: Nodemailer
- **Security**: bcrypt, express-rate-limit
- **Task Scheduling**: node-cron
- **File Processing**: ExcelJS, CSV-Parse

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB database
- SMTP email service credentials

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/avinash-p05/avalanche_2024.git
   cd avalanche_2024
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=production
   
   # Database
   MONGO_URI=your_mongodb_connection_string
   
   # JWT Secret
   JWT_SECRET=your_jwt_secret_key
   
   # Email Configuration
   SMTP_EMAIL=your_smtp_email
   SMTP_PASS=your_smtp_password
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the application**
   ```bash
   # Development
   npm run test
   
   # Production
   npm start
   ```

## 🐳 Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t avalanche-backend .
   ```

2. **Run the container**
   ```bash
   docker run -p 5000:5000 --env-file .env avalanche-backend
   ```

## 📁 Project Structure

```
avalanche_2024/
├── config/
│   └── db.js                  # Database configuration
├── controllers/               # Route controllers
│   ├── authController.js      # Authentication logic
│   ├── teamController.js      # Team management
│   ├── paperController.js     # Paper presentations
│   ├── analyticsController.js # Analytics and reports
│   └── adminController.js     # Admin operations
├── middleware/
│   ├── authMiddleware.js      # JWT authentication
│   └── upload.js             # File upload handling
├── models/                   # Database schemas
│   ├── user_model.js         # User schema
│   ├── team_model.js         # Team schema
│   ├── eventModel.js         # Event schema
│   └── paperPresentationModel.js
├── routes/                   # API routes
├── services/                 # Business logic services
│   ├── emailService.js       # Email templates and sending
│   └── migration.js          # Database migrations
├── static/                   # Built frontend files
├── uploads/                  # File storage
└── utils/                    # Utility functions
```

## 🔗 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/verify-email/:token` - Email verification
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password` - Password reset confirmation
- `POST /api/v1/auth/bulk-import` - Bulk user import

### Team Management
- `POST /api/v1/team/register/event/:id` - Event registration
- `POST /api/v1/team/register/team` - Team registration
- `POST /api/v1/team/payment/complete` - Payment completion
- `POST /api/v1/team/payment/verify` - Payment verification
- `GET /api/v1/team/events/stats` - Event statistics

### Paper Presentation
- `POST /api/v1/paper/papers` - Submit paper
- `GET /api/v1/paper/papers` - Get all papers (admin)
- `GET /api/v1/paper/papers/:id` - Get specific paper
- `PATCH /api/v1/paper/papers/:id` - Update paper status

### Events
- `POST /api/v1/event/import-events` - Import events from JSON

### Admin
- `POST /api/v1/admin/register` - Admin registration
- `POST /api/v1/admin/login` - Admin login
- `GET /api/v1/admin/profile` - Admin profile

### Analytics
- `GET /api/v1/analytics/event-participation` - Event participation data
- `GET /api/v1/analytics/payment-details` - Payment details
- `GET /api/v1/analytics/department-analytics` - Department analytics

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Cross-origin resource sharing setup
- **Proxy Trust**: Configured for deployment behind proxies

## 📧 Email System

The application includes a sophisticated email system with:
- **Verification Emails**: Account activation
- **Welcome Emails**: Post-verification welcome
- **Registration Confirmations**: Team/individual registration
- **Payment Confirmations**: Transaction success notifications
- **Login Credentials**: Bulk import credential delivery

All emails feature a cyberpunk-themed design with animations and responsive layouts.

## 🗄️ Database Models

### User Model
- Authentication details
- Payment status tracking
- Team associations
- Email verification status

### Team Model
- Team composition (2-4 members)
- Leader assignment
- Registration status

### Event Model
- Event details and rules
- Registration limits
- Participation tracking

### Paper Presentation Model
- File upload support
- Status workflow
- Admin feedback system

## 📊 Analytics & Reporting

- **Department-wise Statistics**: Participation by department
- **Event Analytics**: Registration and completion rates
- **Payment Tracking**: Transaction monitoring
- **Data Export**: Excel/CSV export capabilities

## 🛡️ Error Handling

Comprehensive error handling includes:
- Validation errors
- Authentication failures
- Database connection issues
- File upload errors
- Email service failures

## 🔄 Background Tasks

- **Unverified User Cleanup**: Automatic deletion of unverified accounts after 15 minutes
- **Scheduled Tasks**: Using node-cron for maintenance tasks

## 🚀 Deployment

The application is containerized and ready for deployment on:
- Docker containers
- Cloud platforms (AWS, Google Cloud, Azure)
- VPS servers
- Kubernetes clusters

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

**Tech Team KLS GIT**
## 👥 Contributors

Special thanks to all the contributors who made this project possible:

- [@avinash-p05](https://github.com/avinash-p05) - Project Lead & Developer
- [@Ganes5h](https://github.com/Ganes5h) - Full Stack Developer
- [@nirajvernekar02](https://github.com/contributor2) - Backend Developer
- [@manoj](https://github.com/9147) - Frontend Developer

Want to contribute? Check out our [Contributing Guidelines](#-contributing) above!


## 🐛 Issues

Report issues at: [GitHub Issues](https://github.com/avinash-p05/avalanche_2024/issues)

## 📞 Support

For support and queries, contact the Tech Team KLS GIT.

---

**Built with ❄️ for Avalanche 2024**