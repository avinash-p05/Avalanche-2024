import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const StarBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Set up the Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Create the stars
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1000;
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 100;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }

    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(starPositions, 3)
    );

    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Animate the stars
    const animate = () => {
      requestAnimationFrame(animate);
      stars.rotation.x += 0.0001;
      stars.rotation.y += 0.0001;
      renderer.render(scene, camera);
    };

    animate();

    // Clean up the Three.js scene on component unmount
    // return () => {
    //   containerRef.current.removeChild(renderer.domElement);
    // };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    />
  );
};

export default StarBackground;
