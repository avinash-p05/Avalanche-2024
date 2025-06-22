import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three"; // Assuming you're planning to use THREE.js
import lottie from "lottie-web";
import "./RobotAnimation.css"; // Import CSS for door styles and animations
import { Typography } from "@mui/material";

const RobotAnimation = () => {
  const animationContainer = useRef(null);
  const leftDoorRef = useRef(null);
  const rightDoorRef = useRef(null);
  const headingRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900); // Assuming 900px as the threshold for mobile view

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    const timer = setTimeout(() => {
      const headingElement = headingRef.current;
      if (headingElement) {
        const letters = headingElement.textContent.split("");
        headingElement.textContent = "";
        letters.forEach((letter, index) => {
          const span = document.createElement("span");
          span.textContent = letter;
          span.style.opacity = "0";
          headingElement.appendChild(span);

          // Animate each letter
          setTimeout(() => {
            span.style.opacity = "1";
            span.style.transition = "opacity 0.5s ease-in-out";
          }, index * 100); // Delay based on letter index
        });
      }
    }, 4000); // 2 seconds delay

    return () => clearTimeout(timer); // Clean up timer on unmount
  }, []);

  return (
    <div
      style={{
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column", // Stack items vertically
        height: "100vh",
        width: "100%",
        background:"radial-gradient(circle, rgba(57,57,55,1) 0%, rgba(18,18,17,1) 100%)",
        position: "relative", // Allow for absolute positioning
      }}
    >
      {!isMobile && (
        <>
          <div
            ref={leftDoorRef}
            className="door left-door"
            style={{ zIndex: 5 }}
          />
          <div
            ref={rightDoorRef}
            className="door right-door"
            style={{ zIndex: 5 }}
          />
        </>
      )}
      <div
        ref={animationContainer}
        style={{
          width: "100%", // 100% width for responsiveness
          maxWidth: "500px", // Maximum width
          height: "auto", // Auto height to maintain aspect ratio
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative", // Keep this in front of particles
          zIndex: 1, // Ensure it's above the particles
        }}
      />
      <Typography
        ref={headingRef}
        variant="h1"
        sx={{
          color: "white",
          marginTop: "20px",
          fontWeight: "500",
          fontFamily: "SilkScreen, sans-serif",
          textAlign: "center",
          position: "relative",
          display: "inline-block",
          overflow: "hidden",
          whiteSpace: "nowrap",
          fontSize: {
            xs: "2.3rem", // Mobile
            sm: "2.5rem", // Small screens
            md: "3rem", // Medium screens
            lg: "4rem", // Large screens
            xl: "5rem", // Extra large screens
          },
        }}
        className="glitch"
      >
       Avalanche'24
      </Typography>
      <Typography
        ref={headingRef}
        variant="h1"
        sx={{
          color: "white",
          marginTop: "20px",
          fontWeight: "500",
          fontFamily: "SilkScreen, sans-serif",
          textAlign: "center",
          position: "relative",
          display: "inline-block",
          overflow: "hidden",
          whiteSpace: "nowrap",
          fontSize: {
            xs: "2rem", // Mobile
            sm: "2.2rem", // Small screens
            md: "2.5rem", // Medium screens
            lg: "3rem", // Large screens
            xl: "4rem", // Extra large screens
          },
        }}
        
      >
       PIXEL PARADE
      </Typography>
      </div>
  );
};

export default RobotAnimation;