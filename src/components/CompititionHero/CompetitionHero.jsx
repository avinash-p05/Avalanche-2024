import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import './CompetitionHero.css';
import Trophy from '../../assets/Images/trophy.png';
import { Box, CircularProgress, keyframes } from "@mui/material";

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const CompetitionHero = () => {
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const [loading, setLoading] = useState(true);

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
    renderer.setSize(window.innerWidth, window.innerHeight);
    sceneRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer; // Store renderer reference

    // Create animated squares
    const particles = new THREE.Group();
    scene.add(particles);

    for (let i = 0; i < 200; i++) {
      const particleGeometry = new THREE.BoxGeometry(0.07, 0.07, 0.07);
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
      // Hide loader once the first frame is rendered
      setLoading(false);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (sceneRef.current) {
        renderer.dispose();
        sceneRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <Box
        ref={sceneRef}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 0,
          visibility: loading ? "hidden" : "visible",
        }}
      />
      <div className="Competition-hero">
        <div className="Competition-hero-content">
          <img src={Trophy} className='trophy-image' alt="Competition" />
        </div>
        <div className="parallax_scrollPrompt" id="js_scrollPrompt">
          <div className="parallax_scrollPromptShape"></div>
        </div>
      </div>
    </>
  );
};

export default CompetitionHero;
