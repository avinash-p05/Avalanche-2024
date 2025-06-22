import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signup } from "../../store/authSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  TextField,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import CustomButton from "../Button/Button";
import { useNavigate } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ReCAPTCHA from "react-google-recaptcha";

function SignupForm({ onSignupSuccess }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);

  const [isVerified, setIsVerified] = React.useState(false);
  const recaptchaRef = React.useRef();
  const [captchaToken, setcaptchaToken] = useState("");
  const handleRecaptchaChange = (value) => {
    if (value) {
      setIsVerified(true);
      setcaptchaToken(value);
    }
  };

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    usn: "",
    registrationType: "individual",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Convert email to lowercase and USN to uppercase
    const formattedValue =
      name === "email"
        ? value.toLowerCase()
        : name === "usn"
        ? value.toUpperCase()
        : value;

    setFormData({ ...formData, [name]: formattedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isVerified) {
      toast.error("Please complete the reCAPTCHA verification.");
      return;
    }
    // Validate email, password, and USN before dispatching signup
    const emailRegex = /^[^\s@]+@students\.git\.edu$/;
    if (!emailRegex.test(formData.email)) {
      toast.error(
        "Please enter a valid college email (e.g., ...@students.git.edu)."
      );
      return;
    }
    if (formData.password.length < 8 || formData.password.length > 16) {
      toast.error("Password must be between 8 to 16 characters long.");
      return;
    }
    if (formData.usn.length < 10) {
      toast.error("USN must be no more than 10 characters.");
      return;
    }
    if (!captchaToken) {
      toast.error("Captcha token missing.");
      return;
    }

    // Dispatch signup action
    dispatch(signup({ ...formData, captchaToken }))
      .unwrap()
      .then((data) => {
        // toast.success("Signup successful!");
        // toast.success("Verification link has been send to your email!", {
        //   autoClose: false,  // Keeps the toast visible until manually closed
        //   closeOnClick: false, // Prevents it from closing when clicked outside
        // });
        // Clear form fields
        onSignupSuccess(data);
        setFormData({
          username: "",
          email: "",
          password: "",
          usn: "",
          registrationType: "individual",
        });

        // Redirect to login component after successful signup
        navigate("/register-login");
      })
      .catch((error) => {
        toast.error(error.message || "Signup failed.");
      });
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <h3 style={{ textAlign: "center" }}>Sign Up</h3>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <TextField
            label="Full Name"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
            disabled={loading}
            fullWidth
          />
          <TextField
            label="USN"
            name="usn"
            value={formData.usn}
            onChange={handleInputChange}
            required
            disabled={loading}
            fullWidth
          />
          <TextField
            label="College Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={loading}
            fullWidth
          />
          <TextField
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
              style: { fontFamily: "monospace", fontWeight: "bold" }, // Apply monospace and bold
            }}
            sx={{
              "& .MuiInputBase-input": {
                fontFamily: "monospace", // Ensures monospace font in the input field
                fontWeight: "bold", // Ensures bold font weight
              },
            }}
            value={formData.password}
            onChange={handleInputChange}
            required
            disabled={loading}
            fullWidth
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
                sitekey={import.meta.env.VITE_API_CAPTCHA_SITE_KEY}
                onChange={handleRecaptchaChange}
              />
            </div>
          </div>
          <CustomButton
            type="submit"
            variant="outlined"
            color="secondary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </CustomButton>
        </form>
      </div>
    </div>
  );
}

export default SignupForm;
