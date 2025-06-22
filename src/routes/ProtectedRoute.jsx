import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  if (!user) {
    // Redirect to login if the user is not authenticated
    return <Navigate to="/register-login" />;
  }

  if (user.paymentStatus === "pending" && location.pathname !== "/payment") {
    // Redirect to payment page if payment is pending and user is not on the payment page
    return <Navigate to="/payment" />;
  }

  if (user.paymentStatus === "completed" && location.pathname === "/payment") {
    // Redirect away from payment page if payment is already completed
    return <Navigate to="/profile" />;
  }

  // Render the protected component if conditions are met
  return children;
};

export default ProtectedRoute;
