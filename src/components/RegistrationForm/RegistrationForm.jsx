import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./RegistrationForm.css";
import { Loader, Placeholder } from "rsuite";
import { TextField, CircularProgress, Select, MenuItem } from "@mui/material";
import CustomButton from "../Button/Button";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

function RegistrationForm() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [loading, setLoading] = useState(true);
  const [eventDetails, setEventDetails] = useState(null);
  const [error, setError] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [memberIds, setMemberIds] = useState([]);
  const user = useSelector((state) => state.auth.user);
  const [department, setDepartment] = useState("");
  const [topic, setTopic] = useState("");
  const [topics, setTopics] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentTopics, setDepartmentTopics] = useState([]);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch("/csvjson.json");
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const details = data.find((event) => event.event_id === eventId);
        if (!details) throw new Error("Event not found");

        setEventDetails({
          id: details.event_id,
          team: details.teamCount || "1",
          eventType: details.event_type.toLowerCase(),
          minTeamCount: details.minTeamCount,
          maxTeamCount: details.maxTeamCount,
        });
        if (eventId === "MAIN-1") {
          const departmentData = await fetch(
            "/department_paper_presentation_topic.json"
          );
          const departmentTopicsData = await departmentData.json();
          setDepartmentTopics(departmentTopicsData);
          setDepartments([
            ...new Set(departmentTopicsData.map((item) => item.department)),
          ]);
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
        setError("Failed to load event details. Please try again later.");
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const { eventType, id, minTeamCount } = eventDetails;
      const isIndividualEvent = eventType === "individual";

      const requestData = isIndividualEvent
        ? { eventId: id }
        : {
            teamName: teamName,
            memberIds: [user.id, ...memberIds.filter((id) => id)],
            eventId: id,
          };

      const url = isIndividualEvent
        ? `api/v1/team/register/event/${user.id}`
        : `api/v1/team/register/team`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Registration successful!");

        if (eventId === "MAIN-1") {
          const paperResponse = await fetch("api/v1/paper/papers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              department,
              topic,
            }),
          });

          const paperResult = await paperResponse.json();
          if (paperResponse.ok) {
            toast.success("Paper details submitted successfully!");

            Swal.fire({
              title: "Registration Successful!",
              text: "Please join the WhatsApp group for further updates. You can find the link in the Events section of your Profile page.",
              icon: "success",
              confirmButtonColor: "#ffd700",
              confirmButtonText: "Go to Profile",
              allowOutsideClick: false,
            }).then(() => {
              navigate("/profile");
            });
          } else {
            toast.error(
              paperResult.error || "Failed to submit paper details.",
              { autoClose: false }
            );
          }
        } else {
          Swal.fire({
            title: "Registration Successful!",
            text: "Please join the WhatsApp group for further updates. You can find the link in the Events section of your Profile page.",
            icon: "success",
            confirmButtonText: "Go to Profile",
            allowOutsideClick: false,
          }).then(() => {
            navigate("/profile");
          });
        }
      } else {
        toast.error(result.error || "Registration failed. Please try again.", {
          autoClose: false,
        });
      }
    } catch (error) {
      console.error("Registration error:", error.message);
      toast.error(
        error.message || "An unexpected error occurred during registration.",
        { autoClose: false }
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="loading-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
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

  const handleDepartmentChange = (event) => {
    setDepartment(event.target.value);
    // Filter topics based on selected department
    const availableTopics = departmentTopics.filter(
      (item) => item.department === event.target.value
    );
    setTopics(availableTopics.map((item) => item.topic));
    setTopic(""); // Reset topic when department changes
  };

  return (
    <div className="Registration-form" style={{ position: "relative" }}>
      <h2 style={{ textAlign: "center", color: "White" }}>Registration Form</h2>
      <div className="Registration-form-inner">
        <form onSubmit={handleRegister}>
          <div className="Registration-form-content">
            <TextField
              margin="dense"
              label="User Id"
              defaultValue={user.id}
              type="text"
              variant="outlined"
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
              InputLabelProps={{ style: { color: "white" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "white" },
                  "&.Mui-focused fieldset": { borderColor: "white" },
                  color: "white",
                },
                "& .MuiInputBase-input": { color: "white" },
              }}
              required
              disabled={loading}
            />

            {eventDetails.eventType === "team" && (
              <TextField
                margin="dense"
                label="Team Name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                type="text"
                variant="outlined"
                InputLabelProps={{ style: { color: "white" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "white" },
                    "&.Mui-focused fieldset": { borderColor: "white" },
                    color: "white",
                  },
                  "& .MuiInputBase-input": { color: "white" },
                }}
                required
                disabled={loading}
              />
            )}

            {eventDetails.eventType === "team" &&
                Array.from(
                    { length: eventDetails.minTeamCount - 1 },
                    (_, index) => (
                        <TextField
                            key={index}
                            margin="dense"
                            label={`Member ${index + 2} ID`}
                            type="text"
                            variant="outlined"
                            value={memberIds[index] || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              const updatedMemberIds = [...memberIds];
                              updatedMemberIds[index] = value;
                              setMemberIds(updatedMemberIds);
                            }}
                            error={memberIds[index]?.length > 0 && memberIds[index]?.length !== 24}
                            helperText={
                              memberIds[index]?.length > 0 && memberIds[index]?.length !== 24
                                  ? "ID must be exactly 24 characters"
                                  : ""
                            }
                            InputLabelProps={{ style: { color: "white" } }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": { borderColor: "white" },
                                "&.Mui-focused fieldset": { borderColor: "white" },
                                color: "white",
                              },
                              "& .MuiInputBase-input": { color: "white" },
                            }}
                            required
                            disabled={loading}
                        />
                    )
                )}

            {eventDetails.eventType === "team" &&
                Array.from(
                    {
                      length: eventDetails.maxTeamCount - eventDetails.minTeamCount,
                    },
                    (_, index) => (
                        <TextField
                            key={eventDetails.minTeamCount + index}
                            margin="dense"
                            label={`Optional Member ${
                                eventDetails.minTeamCount + index + 1
                            } ID`}
                            type="text"
                            variant="outlined"
                            value={
                                memberIds[eventDetails.minTeamCount + index - 1] || ""
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              const updatedMemberIds = [...memberIds];
                              updatedMemberIds[eventDetails.minTeamCount + index - 1] = value;
                              setMemberIds(updatedMemberIds);
                            }}
                            error={
                                memberIds[eventDetails.minTeamCount + index - 1]?.length > 0 &&
                                memberIds[eventDetails.minTeamCount + index - 1]?.length !== 24
                            }
                            helperText={
                              memberIds[eventDetails.minTeamCount + index - 1]?.length > 0 &&
                              memberIds[eventDetails.minTeamCount + index - 1]?.length !== 24
                                  ? "ID must be exactly 24 characters"
                                  : ""
                            }
                            InputLabelProps={{ style: { color: "white" } }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": { borderColor: "white" },
                                "&.Mui-focused fieldset": { borderColor: "white" },
                                color: "white",
                              },
                              "& .MuiInputBase-input": { color: "white" },
                            }}
                            disabled={loading}
                        />
                    )
                )}


            {eventId === "MAIN-1" && (
              <>
                <Select
                  margin="dense"
                  label="Department"
                  value={department}
                  onChange={handleDepartmentChange}
                  displayEmpty
                  required
                  sx={{
                    width: "80%",
                    color: "white", // Text color for selected value
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "white", // Border color for the outline
                    },
                    "& .MuiSvgIcon-root": {
                      color: "white", // Icon color (dropdown arrow)
                    },
                    "& .MuiOutlinedInput-root": {
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "white", // Border color on hover
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "white", // Border color when focused
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    Select Department
                  </MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>

                <Select
                  margin="dense"
                  label="Topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  displayEmpty
                  sx={{
                    width: "80%",
                    color: "white", // Text color for selected value
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "white", // Border color for the outline
                    },
                    "& .MuiSvgIcon-root": {
                      color: "white", // Icon color (dropdown arrow)
                    },
                    "& .MuiOutlinedInput-root": {
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "white", // Border color on hover
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "white", // Border color when focused
                      },
                    },
                  }}
                  required
                  disabled={!department}
                >
                  <MenuItem value="" disabled>
                    Select Topic
                  </MenuItem>
                  {topics.map((tpc) => (
                    <MenuItem key={tpc} value={tpc}>
                      {tpc}
                    </MenuItem>
                  ))}
                </Select>
              </>
            )}
          </div>
          <div className="registration-event-id">{eventDetails.id}</div>
          <CustomButton
            type="Submit"
            variant="outlined"
            color="secondary"
            className="Registration-form-button"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Registering..." : "Register"}
          </CustomButton>
        </form>
      </div>
    </div>
  );
}

export default RegistrationForm;
