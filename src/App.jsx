import { useEffect } from 'react'
import "./App.css";
import Home from "./pages/Home/Home"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar/NavBar"
import AuthForm from "./pages/Auth/AuthForm";
import Competitions from "./pages/Compitition/Competitions";
import Developers from "./pages/Developer/Developers";
import PageNotFound404 from "./pages/404NotFound/PageNotFound404";
import PaymentComponent from "./components/Payment/PaymentComponent";
import RegistrationForm from "./components/RegistrationForm/RegistrationForm";
import EventPage from "./pages/EventDetails/EventDetailsPage";
import Profile from "./pages/Profile/ProfilePage";
import VerfyPage from "./pages/Auth/VerifyPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoadingWrapper from "./components/Common/LoadingWrapper";
import MoveToTop from "./components/Common/MoveToTop";
import RuleBook from "./pages/Rulebook/RuleBook";

function App() {
  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (event) => {
      event.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextMenu);

    // Disable certain key shortcuts
    const handleKeyDown = (event) => {
      // Block F12
      if (event.key === "F12") {
        event.preventDefault();
      }

      // Block Ctrl+Shift+I (DevTools), Ctrl+Shift+J (Console), Ctrl+U (View Source)
      if (
        (event.ctrlKey &&
          event.shiftKey &&
          (event.key === "I" || event.key === "J")) ||
        (event.ctrlKey && event.key === "U")
      ) {
        event.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup event listeners on component unmount
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return (
    <div>
      <Router>
        <Navbar />
        <MoveToTop />
        <Routes>
          <Route path="/" element={<LoadingWrapper />}>
            <Route exact path="/" element={<Home />}></Route>
            <Route path="*" element={<PageNotFound404 />} />
            <Route exact path="/register-login" element={<AuthForm />}></Route>
            <Route
              exact
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              exact
              path="/competitions"
              element={<Competitions />}
            ></Route>
            <Route exact path="/contact" element={<Developers />}></Route>
            <Route exact path="/rulebook" element={<RuleBook />}></Route>
            <Route exact path="/event/:eventId" element={<EventPage />}></Route>
            <Route exact path="/payment" element={<PaymentComponent />}></Route>
            <Route
              exact
              path="/verify-account/:token"
              element={<VerfyPage />}
            />
            <Route
              exact
              path="/register/:eventId"
              element={
                <ProtectedRoute>
                  <RegistrationForm />
                </ProtectedRoute>
              }
            ></Route>
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
