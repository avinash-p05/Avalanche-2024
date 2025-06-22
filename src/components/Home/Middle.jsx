import React, { useEffect, useRef} from "react";
import * as THREE from "three";
import {
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  Grid,
} from "@mui/material";
import robotImage from "../../assets/Images/Robot.png"; // Replace with the path to your PNG image
import { useNavigate } from "react-router-dom";
const Middele = () => {
  const sceneRef = useRef(null);
  const robotRef = useRef(null);
  const navigate=useNavigate();
  useEffect(() => {
    // Set up Three.js for background
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight * 1);
    sceneRef.current.appendChild(renderer.domElement);

    // Create animated squares
    const particles = new THREE.Group();
    scene.add(particles);

    for (let i = 0; i < 200; i++) {
      const particleGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xfcee0a });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.set(
        (Math.random() - 0.5) * 20, // Increase distribution range
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );
      particles.add(particle);
    }

    const animate = () => {
      requestAnimationFrame(animate);
      particles.rotation.x += 0.0005;
      particles.rotation.y += 0.0005;
      renderer.render(scene, camera);
    };
    animate();

    // return () => {
    //   renderer.dispose();
    //   // sceneRef.current.removeChild(renderer.domElement);
    // };
  }, []);
  const handlenavigation=()=>{
    navigate('/competitions')
  }
  return (
    <Box
      sx={{
        height: "100vh",
        // width: "100%",
        position: "relative",
        backgroundColor: "black",
        color: "white",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Three.js Background */}
      <Box
        ref={sceneRef}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          //   width: "100%",
          // height: "100vh",
          zIndex: 0,
        }}
      />

      {/* First 100vh Section */}
      {/* <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Typography variant="h2" sx={{ mb: 4 }}>
          Our Services
        </Typography>
        <Grid container spacing={4} sx={{ width: "80%" }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Card sx={{ backgroundColor: "#333", color: "white" }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={`https://picsum.photos/400/200?random=${index}`}
                  alt={`Service ${index + 1}`}
                />
                <CardContent>
                  <Typography variant="h6">Service {index + 1}</Typography>
                  <Typography variant="body">
                    This is a brief description of service {index + 1}.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box> */}

      {/* Second 100vh Section */}
      <Box
        sx={{
          // minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 4,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Animated Robot Image */}
        <Box
          sx={{
            width: "40%",
            display: { xs: "none", lg: "flex" }, // Hide on small screens, show on large screens
            justifyContent: "center",
            alignItems: "center",
            animation: "moveRobot 3s ease-in-out infinite alternate",
          }}
        >
          <img
            ref={robotRef}
            src={robotImage}
            alt="Animated Robot"
            style={{
              width: "400px",
              //   height: "400px",
            }}
          />
        </Box>

        {/* Register Now Section */}
        <Box
          sx={{
            width: { xs: "100%", lg: "50%" },
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            color: "white",
          }}
        >
          <Typography variant="h3" sx={{ mb: 2 }}>
            Register Now
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
          Be part of something extraordinary at Avalanche 2024! This event isn’t just about competition—it’s a celebration of innovation, teamwork, and the relentless pursuit of excellence.  Y. This is your moment to shine, inspire, and be inspired. Don’t just watch the future unfold—create it. Register now and make your mark at Avalanche 2024!
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            
            sx={{
              paddingX: "16px",
              backgroundColor: "#ffd700" /* Yellow color as in your design */,
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
              color: "#000",
              fontWeight: 550,
              fontFamily: "SilkScreen",
              fontSize: "1em",
              border: "none",
              position: "relative",
              clipPath:
                "polygon(0% 0%, 93% 0%, 93% 7%, 100% 7%, 100% 11%, 100% 4%, 100% 0, 98% 0, 95% 0, 95% 4%, 100% 4%, 100% 10%, 100% 53%, 100% 69%, 79% 100%, 73% 100%, 83% 100%, 90% 100%, 100% 85%, 100% 76%, 84% 100%, 79% 100%, 73% 100%, 68% 100%, 68% 93%, 59% 93%, 59% 100%, 8% 100%, 0% 85%, 0% 48%, 4% 48%, 4% 39%, 0% 39%, 0% 33%, 0% 42%, 2% 42%, 2% 45%, 0% 45%, 0 42%, 0 36%, 0% 33%)",
              /* Slightly darker yellow on hover */
            }
          }
          onClick={handlenavigation}
          >
            Register
          </Button>
        </Box>
      </Box>

      {/* CSS for robot animation */}
      <style jsx>{`
        @keyframes moveRobot {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(20px);
          }
        }
      `}</style>
    </Box>
  );
};

export default Middele;
