import React, { useEffect, useRef } from "react";
import lottie from "lottie-web";
import { Box, Typography, IconButton } from "@mui/material";
import { Twitter, Instagram, Facebook, YouTube, LinkedIn } from "@mui/icons-material";
import { useNavigate ,useLocation} from "react-router-dom"; // Import useNavigate hook

const navLinks = [
  { label: "Home", url: "/" },
  { label: "Competitions", url: "/competitions" },
  { label: "Rulebook", url: "/rulebook" },
  { label: "Contact", url: "/contact" },
];

const Footer = () => {
  const animationContainer = useRef(null);
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate(); // Initialize the navigate function
  const location = useLocation(); 
  useEffect(() => {
    const animation = lottie.loadAnimation({
      container: animationContainer.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "https://lottie.host/9eb40721-cd7d-4a41-a9cf-96ee90ffc57a/7ITFwzDc6q.json",
    });

    return () => animation.destroy(); // Clean up animation on unmount
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top of the page
  }, [location]); // This will trigger every time the location changes
  // Function to handle navigation when a link is clicked
  const handleNavigation = (url) => {
    navigate(url);
    window.scrollTo(0, 0);
  };

  return (
    <Box
      sx={{
        minHeight: { xs: "auto", md: "40vh" },
        backgroundColor: "black",
        color: "#9DEBFF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-around",
          flexWrap: "wrap",
          mb: 2,
        }}
      >
        {navLinks.map((link, index) => (
          <Box
            key={index}
            onClick={() => handleNavigation(link.url)} // Use handleNavigation for navigation
            sx={{
              color: "#9DEBFF",
              margin: "10px",
              textDecoration: "none",
              fontSize: "1.2rem",
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {link.label} →
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <Box
          ref={animationContainer}
          sx={{
            width: "200px",
            height: "200px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            zIndex: 1,
          }}
        />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2 }}>
        <IconButton
          href="https://www.instagram.com/klsgit_studentcouncil"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "#9DEBFF" }}
        >
          <Instagram />
        </IconButton>
        <IconButton
          href="https://www.linkedin.com/company/klsgitbelagavi/posts/?feedView=all"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "#9DEBFF" }}
        >
          <LinkedIn />
        </IconButton>
        <IconButton
          href="https://www.youtube.com/@klsgitlecturevideos"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "#9DEBFF" }}
        >
          <YouTube />
        </IconButton>
      </Box>
      <Typography variant="body" align="center">
        © {currentYear} Tech Team KLS GIT. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
