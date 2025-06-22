import React,{useState} from "react";
import "./Login.css";
import CustomRadioContainer from "../../components/CustomRadio/CustomRadioContainer";
import LoginForm from "../../components/Auth/LoginForm";
import { toast } from 'react-toastify';
import SignupForm from "../../components/Auth/SignupForm";


function Login() {
    const [selectedOption, setSelectedOption] = useState("events-details-radio-1");
  const handleLoginSuccess = (data) => {
    // Store login data locally
    // localStorage.setItem('authData', JSON.stringify(data));

    // Display a success message and handle any redirects if needed
    toast.success("You are now logged in!");
  };

  const handleSignupSuccess = (data) => {
    toast.success("Please check your email to verify your account.",{autoClose: false,});
    setSelectedOption("events-details-radio-2"); // Switch to login form on successful signup
  };

  return (
    <div className="TwoRadio">
      <CustomRadioContainer
        content1={
            <LoginForm onLoginSuccess={handleLoginSuccess} />
        }
        content2={
            <SignupForm onSignupSuccess={handleSignupSuccess} />
        }
        button1="Login"
        button2="SignUp"
        numOptions="2"
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
      />
      
    </div>
  );
}

export default Login;