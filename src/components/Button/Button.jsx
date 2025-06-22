import React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

const StyledButton = styled(Button)(({ theme }) => ({
  paddingX: "16px",
  paddingY: "4px",
  backgroundColor: "#ffd700", // Yellow color
  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
  color: "#000",
  fontWeight: 550,
  fontFamily: "SilkScreen",
  fontSize: "1em",
  border: "none",
  position: "relative",
  clipPath:
    "polygon(0% 0%, 93% 0%, 93% 7%, 100% 7%, 100% 11%, 100% 4%, 100% 0, 98% 0, 95% 0, 95% 4%, 100% 4%, 100% 10%, 100% 53%, 100% 69%, 79% 100%, 73% 100%, 83% 100%, 90% 100%, 100% 85%, 100% 76%, 84% 100%, 79% 100%, 73% 100%, 68% 100%, 68% 93%, 59% 93%, 59% 100%, 8% 100%, 0% 85%, 0% 48%, 4% 48%, 4% 39%, 0% 39%, 0% 33%, 0% 42%, 2% 42%, 2% 45%, 0% 45%, 0 42%, 0 36%, 0% 33%)",
  "&:hover": {
    backgroundColor: "#e6b800", // Slightly darker yellow
  },
}));

const CustomButton = ({ children, ...props }) => {
  return <StyledButton {...props}>{children}</StyledButton>;
};

export default CustomButton;
