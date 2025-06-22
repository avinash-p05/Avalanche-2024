import React from "react";
import  EventPage  from "../../components/EventPage/EventsPage";
import Hero from "../../components/CompititionHero/CompetitionHero";
import Footer from "../../components/Footer/Footer";

function Home() {
  return (
    <div style={{background:"radial-gradient(circle at center, #151515 10%, #0d0d0d 100%)"}}>
        <Hero/>
        <EventPage/>
        <Footer/>
    </div>
  );
}

export default Home;