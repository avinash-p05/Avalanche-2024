// services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.SMTP_EMIAL, 
      pass: process.env.SMTP_PASS, 
    },
  });
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
      .snowflake {
          position: absolute;
          color: #00A3FF;
          opacity: 0.5;
          animation: fall 3s linear infinite;
      }
      @keyframes fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(100px) rotate(360deg); opacity: 0; }
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
      .button {
          display: inline-block;
          padding: 12px 30px;
          background: linear-gradient(90deg, #00A3FF, #00FFE0);
          color: #000915;
          text-decoration: none;
          text-transform: uppercase;
          font-weight: bold;
          border-radius: 3px;
          margin: 20px 0;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
      }
      .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(0, 163, 255, 0.4);
      }
      .button::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: rgba(255, 255, 255, 0.1);
          transform: rotate(45deg);
          animation: shine 3s infinite;
      }
      @keyframes shine {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
      }
      .status-box {
          border: 1px solid #00A3FF;
          padding: 15px;
          margin: 20px 0;
          background: rgba(0, 163, 255, 0.1);
          position: relative;
      }
      .status-box::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, transparent 0%, rgba(0, 163, 255, 0.1) 50%, transparent 100%);
          animation: pulse-bg 2s infinite;
      }
      @keyframes pulse-bg {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
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
          position: relative;
      }
      .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          animation: shine-progress 2s infinite;
      }
      @keyframes fillProgress {
          from { width: 0; }
          to { width: 100%; }
      }
      @keyframes shine-progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
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

const generateSnowflakes = () => {
  let snowflakes = '';
  for(let i = 0; i < 5; i++) {
      const left = Math.random() * 100;
      const delay = Math.random() * 2;
      snowflakes += `<div class="snowflake" style="left: ${left}%; animation-delay: ${delay}s;">❄</div>`;
  }
  return snowflakes;
};

const sendVerificationEmail = async (to, token) => {
  const verificationLink = `${process.env.FRONTEND_URL}/api/auth/verify-email/${token}`;
  
  try {
      await transporter.sendMail({
          from: process.env.SMTP_EMAIL,
          to,
          subject: '❄️ Verify Your Avalanche Account',
          html: `
              ${getBaseStyle()}
              <div class="container">

                  <div class="logo">
                      <h1>AVALANCHE 2024</h1>
                  </div>
                  <div class="header">
                      <h2>Account Verification</h2>
                  </div>
                  <div class="content">
                      <p>Welcome to Avalanche 2024!</p>
                      <p>Your journey begins here. Verify your account to unlock your full potential.</p>
                      <div class="status-box">
                          <p>VERIFICATION STATUS: PENDING</p>
                          <div class="progress-bar">
                              <div class="progress-fill"></div>
                          </div>
                      </div>
                      <a href="${verificationLink}" class="button">VERIFY ACCOUNT</a>
                      <p>Link expires 15 Minutes. Act fast to secure your spot!</p>
                  </div>
                  <div class="footer">
                      <p>AVALANCHE 2024 • SECURE VERIFICATION SYSTEM</p>
                  </div>
              </div>
          `
      });
      console.log('Verification email sent successfully');
  } catch (error) {
      console.error('Failed to send verification email:', error);
      throw error;
  }
};

const sendWelcomeEmail = async (to) => {
  try {
      await transporter.sendMail({
          from: process.env.SMTP_EMAIL,
          to,
          subject: '❄️ Welcome to Avalanche 2024!',
          html: `
              ${getBaseStyle()}
              <div class="container">
               
                  <div class="logo">
                      <h1>AVALANCHE 2024</h1>
                  </div>
                  <div class="header">
                      <h2>Welcome Aboard!</h2>
                  </div>
                  <div class="content">
                      <p>Congratulations on joining Avalanche 2024!</p>
                      <p>Your account has been successfully verified and activated.</p>
                      <div class="status-box">
                          <p>ACCOUNT STATUS: ACTIVE</p>
                          <p>VERIFICATION: COMPLETE</p>
                          <div class="progress-bar">
                              <div class="progress-fill"></div>
                          </div>
                      </div>
                      <p>Ready to begin your journey? Complete your registration now!</p>
                  </div>
                  <div class="footer">
                      <p>AVALANCHE 2024 • WHERE LEGENDS BEGIN</p>
                  </div>
              </div>
          `
      });
  } catch (error) {
      console.error('Failed to send welcome email:', error);
  }
};

const sendTeamRegistrationEmail = async (to, teamName, registrationType, teamSize = null) => {
  try {
      const subject = registrationType === 'team'
          ? '❄️ Team Registration Complete - Avalanche 2024'
          : '❄️ Solo Registration Complete - Avalanche 2024';
      
      const content = registrationType === 'team'
          ? `
              <p>Congratulations on forming your team!</p>
              <p>Team "${teamName}" has been successfully registered with ${teamSize} members.</p>
              <div class="status-box">
                  <p>TEAM STATUS: REGISTERED</p>
                  <p>TEAM SIZE: ${teamSize}/${teamSize}</p>
   
                  <div class="progress-bar">
                      <div class="progress-fill"></div>
                  </div>
              </div>
          `
          : `
              <p>Congratulations on your registration!</p>
              <p>Your solo registration has been confirmed.</p>
              <div class="status-box">
                  <p>REGISTRATION STATUS: COMPLETE</p>
   
                  <div class="progress-bar">
                      <div class="progress-fill"></div>
                  </div>
              </div>
          `;
      
      await transporter.sendMail({
          from: process.env.SMTP_EMAIL,
          to,
          subject,
          html: `
              ${getBaseStyle()}
              <div class="container">
              
                  <div class="logo">
                      <h1>AVALANCHE 2024</h1>
                  </div>
                  <div class="header">
                      <h2>Registration Confirmed</h2>
                  </div>
                  <div class="content">
                      ${content}
                  </div>
                  <div class="footer">
                      <p>AVALANCHE 2024 • UNLEASH YOUR POTENTIAL</p>
                  </div>
              </div>
          `
      });
      console.log('Registration email sent successfully');
  } catch (error) {
      console.error('Failed to send registration email:', error);
  }
};

const sendPaymentConfirmationEmail = async (to, amount, transactionId, userId) => {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_EMAIL,
            to,
            subject: 'Payment Confirmed - Avalanche 2024',
            html: `
                ${getBaseStyle()}
                <div class="container">
                    
                    <div class="logo">
                        <h1>AVALANCHE 2024</h1>
                    </div>
                    <div class="header">
                        <h2>Payment Successful</h2>
                    </div>
                    <div class="content">
                        <p>Thank you for completing your payment!</p>
                        <div class="status-box">
                            <p>PAYMENT STATUS: CONFIRMED</p>
                            <p>AMOUNT: ₹${amount}</p>
                            <p>TRANSACTION ID: ${transactionId}</p>
                            <p>USER ID: ${userId}</p>
                            <div class="progress-bar">
                                <div class="progress-fill"></div>
                            </div>
                        </div>
                        <p>You're all set! Get ready for an amazing experience at Avalanche 2024.</p>
                        <a href="${process.env.FRONTEND_URL}/dashboard" class="button">VIEW DASHBOARD</a>
                    </div>
                    <div class="footer">
                        <p>AVALANCHE 2024 • THE ADVENTURE AWAITS</p>
                    </div>
                </div>
            `
        });
    } catch (error) {
        console.error('Failed to send payment confirmation email:', error);
    }
  };

  const sendLoginCredentialsEmail = async (to, name, usn, password) => {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_EMAIL,
            to,
            subject: '🔐 Your Avalanche 2024 Login Credentials',
            html: `
                ${getBaseStyle()}
                <div class="container">
                    <div class="logo">
                        <h1>AVALANCHE 2024</h1>
                    </div>
                    <div class="header">
                        <h2>Your Login Credentials</h2>
                    </div>
                    <div class="content">
                        <p>Welcome ${name}!</p>
                        <p>Your Avalanche 2024 account has been created. Here are your login credentials:</p>
                        <div class="status-box">
                            <p>USERNAME/EMAIL: ${to}</p>
                            <p>USN: ${usn}</p>
                            <p>PASSWORD: ${password}</p>
                            <div class="progress-bar">
                                <div class="progress-fill"></div>
                            </div>
                        </div>
                        <p><strong>Important:</strong> Please change your password after your first login.</p>
                        <a href="${process.env.FRONTEND_URL}/login" class="button">LOGIN NOW</a>
                    </div>
                    <div class="footer">
                        <p>AVALANCHE 2024 • SECURE ACCESS SYSTEM</p>
                        <p>For security reasons, please delete this email after memorizing or safely storing your credentials.</p>
                    </div>
                </div>
            `
        });
        console.log(`Login credentials email sent to ${to}`);
    } catch (error) {
        console.error('Failed to send login credentials email:', error);
        throw error;
    }
};


module.exports = { 
    sendVerificationEmail, 
    sendWelcomeEmail,
    sendTeamRegistrationEmail,
    sendPaymentConfirmationEmail ,
    sendLoginCredentialsEmail
};