import React, { createContext, useContext, useState, useEffect } from 'react';

const EventDetailsContext = createContext();

export const useEventDetailsContext = () => useContext(EventDetailsContext);

export const EventDetailsProvider = ({ children }) => {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetch('/departments.json')
      .then((response) => response.json())
      .then((data) => setDepartments(data));
  }, []);

  const getEventDetailsById = (eventId) => {
    for (let department of departments) {
      for (let event of department.events) {
        if (event.id === Number(eventId)) {
          return { ...event, department: department.name };
        }
      }
    }
    return null;
  };

  return (
    <EventDetailsContext.Provider value={{ departments, getEventDetailsById }}>
      {children}
    </EventDetailsContext.Provider>
  );
};