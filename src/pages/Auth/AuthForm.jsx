import React from "react";
import styled from "styled-components";
// import "./login.css";
import StarBackground from "../../components/Common/StarBackground";
import Login from "./Login";

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
      <Login />
    </StyledForm>
  );
};

export default Form;
