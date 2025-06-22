import React from 'react';
import { useParams } from 'react-router-dom';
import  EventView  from "../../components/EventView/EventView";

function EventDetailPage() {
    const { eventId } = useParams();
  return (
    <div style={{background:"radial-gradient(circle at center, #151515 10%, #0d0d0d 100%)",display:"flex",flexDirection:"column",minHeight:"100vh",justifyContent:"center",alignItems:"center"}}>
        <EventView
        eventId={eventId}
        />
    </div>

  );
}

export default EventDetailPage;