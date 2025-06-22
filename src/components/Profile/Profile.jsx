import React, { useState, useEffect } from "react";
import axios from "axios";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import CustomRadioContainer from "../CustomRadio/CustomRadioContainer";
import { useSelector } from "react-redux";
import "./Profile.css";

const defaultProfileImage =
  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

function Profile() {
  const [selectedOption, setSelectedOption] = useState(
    "events-details-radio-1"
  );
  const [userData, setUserData] = useState(null);
  const [eventData, setEventData] = useState(null);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `api/v1/team/get-user-event/${user.id}`
        );
        setUserData(response.data.user);
        setEventData(response.data.events);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user.id]);

  if (!userData) {
    return <div>Loading...</div>;
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(userData._id);
    alert("ID copied to clipboard!");
  };

  const profileContent = (
    <PerfectScrollbar>
      <div className="profile-container">
        <h2 className="profile-title">Profile Information</h2>
        <table className="profile-table">
          <tbody>
            <tr>
              <td>
                <strong>ID:</strong>
              </td>
              <td>
                <button onClick={handleCopyId} className="copy-button">
                  Copy ID
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <strong>Name:</strong>
              </td>
              <td>{userData.username}</td>
            </tr>
            <tr>
              <td>
                <strong>Email:</strong>
              </td>
              <td>{userData.email}</td>
            </tr>
            <tr>
              <td>
                <strong>USN:</strong>
              </td>
              <td>{userData.usn}</td>
            </tr>
            <tr>
              <td>
                <strong>Verified:</strong>
              </td>
              <td>{userData.isVerified ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <td>
                <strong>Payment Status:</strong>
              </td>
              <td>{userData.paymentStatus}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </PerfectScrollbar>
  );

  const eventsContent = (
    <PerfectScrollbar>
      <div className="events-container">
        <h2 style={{ textAlign: "center" }}>Events Participating</h2>
        {eventData && eventData.length > 0 ? (
          <ul className="events-list">
            {eventData.map((event) => (
              <li key={event._id} className="event-item">
                {event.event_name} -{" "}
                <a
                  href={event.whatsapp_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join WhatsApp Group
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No events to display</p>
        )}
      </div>
    </PerfectScrollbar>
  );

  return (
    <div className="TwoRadio">
      <CustomRadioContainer
        content1={profileContent}
        content2={eventsContent}
        button1="Profile"
        button2="Events"
        numOptions="2"
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
      />
    </div>
  );
}

export default Profile;
