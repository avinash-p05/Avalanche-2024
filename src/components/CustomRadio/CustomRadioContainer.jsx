import React, { useState } from "react";
import "./CustomRadioContainer.css";


// note wrap in an element with classname TwoRadio to apply the styles incase of nomOptions = 2
function CustomRadioContainer({
  content1,
  content2,
  content3,
  button1,
  button2,
  button3,
  numOptions = 3,
  onRadioChange,
  selectedOption,
  setSelectedOption,
}) {
  const handleRadioChange = (event) => {
    setSelectedOption(event.target.id);
    onRadioChange && onRadioChange(event.target.id); // Call the onRadioChange callback if provided
  };

  return (
    <div className="EventView-content">
      <div className="EventView-content-inner">

          {selectedOption === "events-details-radio-1" && (
            <div className="EventView-content-box radio-content-box">
              {content1}
            </div>
          )}
          {selectedOption === "events-details-radio-2" && (
            <div className="EventView-content-box radio-content-box">
              {content2}
            </div>
          )}
          {selectedOption === "events-details-radio-3" && numOptions === 3 && (
            <div className="EventView-content-box radio-content-box">
              {content3}
            </div>
          )}
 
      </div>
      <div className="container-radio-events-details">
        <div className="events-details-custom-radio">
          <input
            type="radio"
            id="events-details-radio-1"
            name="tabs"
            checked={selectedOption === "events-details-radio-1"}
            onChange={handleRadioChange}
          />
          <label
            className="events-details-radio-label slice slice1"
            htmlFor="events-details-radio-1"
          >
            <span className="events-details-radio-text slice-text">
              {button1}
            </span>
          </label>

          <input
            type="radio"
            id="events-details-radio-2"
            name="tabs"
            checked={selectedOption === "events-details-radio-2"}
            onChange={handleRadioChange}
          />
          <label
            className="events-details-radio-label slice slice2"
            htmlFor="events-details-radio-2"
          >
            <span className="events-details-radio-text slice-text">
              {button2}
            </span>
          </label>

          {numOptions === 3 && (
            <>
              <input
                type="radio"
                id="events-details-radio-3"
                name="tabs"
                checked={selectedOption === "events-details-radio-3"}
                onChange={handleRadioChange}
              />
              <label
                className="events-details-radio-label slice slice3"
                htmlFor="events-details-radio-3"
              >
                <span className="events-details-radio-text slice-text">
                  {button3}
                </span>
              </label>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomRadioContainer;
