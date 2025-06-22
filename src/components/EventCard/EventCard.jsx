// EventCard.js
import React from 'react';
import './EventCard.css';
import backgroundImage from '../../assets/events_frame.png'; // Adjust the path as necessary

function EventCard({ image, title,tagline,description, onRegister ,onExplore}) {
  return (
    <div className="event-card">
      <div className="event-card-image" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="image-card">
        <img src={image} alt={title} className="card-image" />
        <div className="card-content">
          <h2>{title}</h2>
          <p>{tagline}</p>
        </div>
      </div>
      </div>
      <div className="event-buttons">
      <button className="event-card-register" onClick={onRegister}>
        REGISTER
      </button>
      <button className="event-card-register" onClick={onExplore}>
        Explore
      </button>
      </div>
    </div>
  );
}

export default EventCard;
