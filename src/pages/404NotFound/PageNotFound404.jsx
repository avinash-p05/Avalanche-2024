import React, { useEffect, useRef } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import lottie from "lottie-web";
import HomeIcon from "@mui/icons-material/Home";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CustomButton from "../../components/Button/Button";
const NotFound = () => {
  const navigate = useNavigate();
  const lottieContainer = useRef(null);

  useEffect(() => {
    // Load the Lottie animation
    const animationInstance = lottie.loadAnimation({
      container: lottieContainer.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "https://lottie.host/8aec36cc-1a74-4534-a245-c78f7e878905/C1O5VtY61t.json",
    });

    // Cleanup the animation on unmount
    return () => animationInstance.destroy();
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#121222",
        p: 3,
        textAlign: "center",
      }}
    >
      {/* Lottie Animation */}
      <Box sx={{ width: 250, height: 250, mb: 3 }} ref={lottieContainer} />

      {/* Error Message */}
      <Typography variant="h1" color="primary" gutterBottom>
        404
      </Typography>
      <Typography variant="h6" color="white" paragraph>
        DOES NOT COMPUTE: PAGE NOT FOUND
      </Typography>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <CustomButton
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate("/")}
          color="primary"
        >
          Return Home
        </CustomButton>
        <CustomButton
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => window.history.back()}
          color="secondary"
        >
          Go Back
        </CustomButton>
      </Box>
    </Box>
  );
};

export default NotFound;
