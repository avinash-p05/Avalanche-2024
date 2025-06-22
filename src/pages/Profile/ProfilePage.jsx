import React from "react";
import styled from "styled-components";
// import "./login.css";
import StarBackground from "../../components/Common/StarBackground";
import Profile from "../../components/Profile/Profile";

const StyledForm = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #121211;
  position: relative;
  overflow: hidden;
`;

const Form = () => {
  return (
    <StyledForm>
      <StarBackground />
      <Profile />
    </StyledForm>
  );
};

export default Form;
