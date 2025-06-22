import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from '../EventCard/EventCard';
import RadioBtn from '../RadioButton/RadioBtn';
import defaultImage from '../../assets/event_default.jpg';
import { DeptProvider, useDeptContext } from '../../context/DeptContext';
import { Loader, Placeholder } from 'rsuite';
import './EventsPage.css';

function EventsPage() {
  const navigate = useNavigate();
  const { deptStates, setDeptStates } = useDeptContext();
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/csvjson.json');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        // Process data to group events by unique department
        const departmentsData = data.reduce((acc, item) => {
          const { department, event_id, event_name, event_tagline, description, rules, contact_details,imageUrl } = item;

          if (!department) return acc;  // Skip empty departments

          const event = {
            id: event_id,
            title: event_name,
            tagline: event_tagline || '',
            description: description || '',
            rules: rules || '',
            contact: contact_details || '',
            image: imageUrl ||defaultImage,
          };

          if (!acc[department]) {
            acc[department] = { name: department, events: [] };
          }
          acc[department].events.push(event);
          return acc;
        }, {});

        setDepartments(Object.values(departmentsData));

        // Initialize department states
        const updatedDeptStates = Object.keys(departmentsData).map((name, index) => ({
          name,
          isActive: index === 0,
        }));
        setDeptStates([{ name: 'All', isActive: false }, ...updatedDeptStates]);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [setDeptStates]);

  const handleExplore = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  const handleRegister = (eventId) => {
    navigate("/register/" + eventId);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <Placeholder.Paragraph rows={8} />
        <Loader center content="Loading Events" />
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

  return (
    <div className="Department_container">
      <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
        <h1 className="Department-title">SELECT DEPARTMENT</h1>
      </div>
      <div className="dept-radio-cover">
        <div className="dept-radio-innercover">
          <div className="dept-radio-outercontainer">
            <RadioBtn key="All" name="All" />
            {deptStates
              .filter((dept) => dept.name !== 'All')
              .map((dept) => (
                <RadioBtn key={dept.name} name={dept.name} />
              ))}
          </div>
        </div>
        <span className="dept-color-choice-radio-container">
          <span className="dept-color-choice-radio-wrapper">
            <span className="select-color">
              <span className="color-box"></span>
              <span className="color-box-label">Selected</span>
            </span>
            <span className="unselect-color">
              <span className="color-box"></span>
              <span className="color-box-label">Unselected</span>
            </span>
          </span>
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center',minHeight:"100px"}}>
        {departments.map((department) =>
          deptStates.find((dept) => dept.name === department.name && dept.isActive) &&
          department.events.map((event) => (
            <EventCard
              key={event.id}
              image={event.image}
              title={event.title}
              tagline={event.tagline}
              description={event.description}
              rules={event.rules}
              contact={event.contact}
              onRegister={() => handleRegister(event.id)}
              onExplore={() => handleExplore(event.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function Section() {
  return (
    <DeptProvider>
      <EventsPage />
    </DeptProvider>
  );
}
