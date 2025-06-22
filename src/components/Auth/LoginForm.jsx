import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/authSlice";
import {
  TextField,
  CircularProgress,
  InputAdornment,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import CustomButton from "../Button/Button";
import axios from "axios";
import "./loginForm.css";
import ReCAPTCHA from "react-google-recaptcha";

function LoginForm({ onLoginSuccess }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [captchaToken, setrecToken] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // Step in the reset flow
  const [timer, setTimer] = useState(900); // 15 minutes timer
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [loadingForgotmail, setLoadingForgotmail] = useState(false);
  // Handle email and password input changes
  const handleEmailChange = (e) => setEmail(e.target.value.toLowerCase());
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const [isVerified, setIsVerified] = React.useState(false);
  const recaptchaRef = React.useRef();

  const handleRecaptchaChange = (value) => {
    if (value) {
      setIsVerified(true);
      setrecToken(value);
    }
  };

  // Login function
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 8 || password.length > 16) {
      toast.error("Password must be between 8 to 16 characters long.");
      return;
    }
    if (!isVerified) {
      toast.error("Please complete the reCAPTCHA verification.");
      return;
    }

    dispatch(login({ email, password, captchaToken })) // Pass captchaToken here
      .unwrap()
      .then((data) => {
        onLoginSuccess(data);
        navigate("/profile");
      })
      .catch((error) => toast.error(error.message || "Login failed."));
  };

  // Reset password steps
  const handleOpenResetDialog = () => setOpenResetDialog(true);

  const handleCloseResetDialog = () => {
    setOpenResetDialog(false);
    setStep(1);
    setResetEmail("");
    setOtp("");
    setNewPassword("");
  };

  // Step 1: Send OTP to email
  const handleSendOtp = async () => {

    setLoadingForgotmail(true);
    try {
      await axios.post("api/v1/auth/forgot-password", {
        email: resetEmail,
      });
      toast.success("OTP sent to your email.");
      setStep(2); // Move to OTP input and new password step
      setTimer(900); // Reset timer to 15 minutes
    } catch (error) {
      toast.error("Failed to send OTP. Try again.");
    } finally {
      setLoadingForgotmail(false); // Stop loading spinner
    }
  };

  // Step 2: Verify OTP and reset password
  const handleResetPassword = async () => {
    try {
      await axios.post("api/v1/auth/reset-password", {
        email: resetEmail,
        otp,
        newPassword,
      });
      toast.success("Password reset successful!");
      handleCloseResetDialog();
    } catch (error) {
      toast.error("Failed to reset password. Please check OTP and try again.");
    }
  };

  // Timer for OTP step
  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  const formatTimer = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1 style={{ textAlign: "center" }}>Login</h1>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
            fullWidth
            disabled={loading}
          />
          <TextField
            label="Password"
            value={password}
            type={showPassword ? "text" : "password"}
            onChange={handlePasswordChange}
            required
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
              style: { fontFamily: "monospace", fontWeight: "bold" }, // Apply monospace font
            }}
            sx={{
              "& .MuiInputBase-input": {
                fontFamily: "monospace",
                fontWeight: "bold", // Ensures monospace font in the input field
              },
            }}
            disabled={loading}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
            className="recaptcha-outer-container"
          >
            <div className="recaptcha-container">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey= {import.meta.env.VITE_API_CAPTCHA_SITE_KEY}
                onChange={handleRecaptchaChange}
              />
            </div>
          </div>
          <div className="forgot-password" onClick={handleOpenResetDialog}>
            Forgot Password?
          </div>
          <CustomButton
            type="submit"
            variant="outlined"
            color="secondary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Login"}
          </CustomButton>
        </form>

        {/* Password Reset Dialog */}
        <Dialog open={openResetDialog} onClose={handleCloseResetDialog}>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogContent>
            {step === 1 && (
              <>
                <TextField
                  label="Enter your college email"
                  type="email"
                  fullWidth
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value.toLowerCase())}
                  required
                />
                <Button
                  onClick={handleSendOtp}
                  variant="contained"
                  color="primary"
                  style={{ marginTop: 20 }}
                  disabled={loadingForgotmail} // Disable button while loading
                >
                  {loadingForgotmail ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </>
            )}
            {step === 2 && (
              <>
                <TextField
                  label="Enter OTP"
                  type="text"
                  fullWidth
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <TextField
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  value={newPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{ marginTop: 10 }}
                />
                <div style={{ marginTop: 10 }}>
                  Time remaining: {formatTimer()}
                </div>
                <Button
                  onClick={handleResetPassword}
                  variant="contained"
                  color="primary"
                  style={{ marginTop: 20 }}
                >
                  Reset Password
                </Button>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseResetDialog} color="secondary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default LoginForm;
