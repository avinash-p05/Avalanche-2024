import {React,useEffect, useState} from "react";
import Hero from "../../components/Home/Hero";
import Desc from "../../components/Home/Desc";
import Footer from "../../components/Footer/Footer";
import Middle from "../../components/Home/Middle";
import audioFile from "../../assets/gateOpen (1).mp3";
function Home() {
  useState(() => {
    const audio = new Audio(audioFile);
    
    // Play audio when component mounts
    const playAudio = async () => {
      try {
        await audio.play();
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    };

    playAudio(); // Call function to play audio

    return () => {
      // Clean up the audio on unmount
      audio.pause();
      audio.currentTime = 0; // Reset playback time
    };
  }, []);
  return (
    <div>
      <Hero />
      <Desc />
      <Middle />
      <Footer />
    </div>
  );
}

export default Home;
