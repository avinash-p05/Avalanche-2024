import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader, Placeholder } from 'rsuite';
import defaultImage from '../../assets/event_default.jpg';
import CustomRadioContainer from '../CustomRadio/CustomRadioContainer';
import './EventView.css';
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function EventView() {
  // Get eventId from URL params instead of props
  const { eventId } = useParams();
  const [selectedOption, setSelectedOption] = useState("events-details-radio-1");
  const [eventDetails, setEventDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleBack=()=>{
    navigate("/competitions")
  }

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/csvjson.json');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const details = data.find(event => event.event_id === eventId);
        
        if (!details) {
          throw new Error('Event not found');
        }

        // Transform the data to match the structure used in EventsPage
        setEventDetails({
          id: details.event_id,
          title: details.event_name,
          tagline: details.event_tagline || '',
          description: details.description || '',
          rules: details.rules || '',
          contact: details.contact_details || '',
          image:details.imageUrl || defaultImage,
          department: details.department
        });

      } catch (error) {
        console.error('Error fetching event details:', error);
        setError('Failed to load event details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const handleRegister = () => {
    navigate("/register/" + eventId);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <Placeholder.Paragraph rows={8} />
        <Loader center content="Loading Event Details" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!eventDetails) {
    return (
      <div className="error-container">
        <h2>Event Not Found</h2>
        <p>The requested event could not be found.</p>
      </div>
    );
  }

  return (
    <div className="EventView-container">
      <div className="EventView-section">
        <div className="event-card">
          <div className="event-card-image">
            <div className="image-card">
              <img 
                src={eventDetails.image} 
                alt={eventDetails.title} 
                className="card-image" 
              />
              <div className="card-content">
                <h2>{eventDetails.title}</h2>
                <p className="event-tagline">{eventDetails.tagline}</p>
                <p>{eventDetails.tagline}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="EventView-section">
        <CustomRadioContainer
          content1={<div style={{paddingTop:"1rem",textAlign:"left",fontFamily:"Monospace",fontWeight:"bold"}}  dangerouslySetInnerHTML={{ __html: eventDetails.description }} />}
          content2={<div style={{paddingTop:"1rem",textAlign:"left",fontFamily:"Monospace",fontWeight:"bold"}} dangerouslySetInnerHTML={{ __html: eventDetails.rules }} />}
          content3={<div style={{paddingTop:"1rem",textAlign:"left",fontFamily:"Monospace",fontWeight:"bold"}} dangerouslySetInnerHTML={{ __html: eventDetails.contact }} />}
          button1="About"
          button2="Rules"
          button3="Contact"
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
        />
        
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',flexWrap:'wrap'}} className="button-container">
        <button 
            className="event-card-register" 
            onClick={handleRegister}
          >
            REGISTER
          </button>
        <button 
            className="event-card-register" 
            onClick={handleBack}
          >
            GO Back
          </button>
          
        </div>
      </div>
    </div>
  );
}

// Export the component without the extra Section wrapper
export default EventView;