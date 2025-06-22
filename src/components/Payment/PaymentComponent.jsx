import React, { useState, useEffect } from "react";
import { Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { updatePaymentStatus } from "../../store/authSlice";
import "./PaymentComponent.css";

function PaymentComponent({
  image,
  title,
  description,
  onRegister,
  onExplore,
}) {
  const [isBlurred, setIsBlurred] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [isLoading, setIsLoading] = useState(false); // New loading state

  const amount = 50; // Default amount for submission only
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user || !user.id) {
      toast.error("User not authenticated. Redirecting to login.");
      navigate("/register-login");
    }
  }, [navigate, user]);

  const handleShowMore = () => {
    setIsBlurred(true);
    setShowBankDetails(true);
    setShowPaymentForm(false);
  };

  const handleDone = () => {
    setIsBlurred(true);
    setShowPaymentForm(true);
    setShowBankDetails(false);
  };

  const handleClose = () => {
    setIsBlurred(false);
    setShowBankDetails(false);
    setShowPaymentForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const numericTransactionId = /^[0-9]+$/.test(transactionId);
    if (transactionId.length !== 12 || !numericTransactionId) {
      toast.error(
        "Transaction/UTR ID must be at least 12 digits long and contain only numbers."
      );
      return;
    }
  
    setIsLoading(true);
    try {
      await dispatch(updatePaymentStatus({ userId: user.id, transactionId, amount })).unwrap();
      toast.success("Payment successful!");
      handleClose();
      navigate("/profile"); // Redirect to profile page on success
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error || "Payment failed");
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };
  

  return (
    <div className="Payment-outer-container">
      <div className="Payment-inner-container">
        <h2 style={{ textAlign: "center" }}>Payment Pending</h2>
        <h3>Amount Rs. {amount} has to be paid</h3>

        <div className="Payment-details">
          <div className="Payment-details-inner">
            <div
              className={`Payment-details-content ${isBlurred ? "blur" : ""}`}
            >
              {/* Conditionally Render Bank Details */}
              {showBankDetails && (
                <div className="bank-details">
                  <h4>Bank Details</h4>
                  <p>Name of Bank: KARNATAKA BANK LTD</p>
                  <p>Name of Branch: Udyambag, Belagavi-59008</p>
                  <p>Account Number: 1162500100010801</p>
                  <p>IFSC Code: KARB0000116</p>
                  <p>MICR Code: 590052004</p>
                  <Button onClick={handleClose} disabled={isLoading}>
                    Close
                  </Button>
                </div>
              )}

              {/* Conditionally Render Payment Form */}
              {showPaymentForm && (
                <div className="payment-form">
                  <h4>Payment Form</h4>
                  <form onSubmit={handleSubmit}>
                  <TextField
  margin="dense"
  label="User Id"
  type="text"
  fullWidth
  variant="outlined"
  defaultValue={user.id}
  InputProps={{
    readOnly: true,
  }}
  InputLabelProps={{
    style: { color: "#ffd700" }, // Label color
  }}
  sx={{
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#ffd700", // Outline color
      },
      "&:hover fieldset": {
        borderColor: "#ffb400", // Hover color
      },
      "&.Mui-focused fieldset": {
        borderColor: "#ffa500", // Focus color
      },
    },
  }}
/>

<TextField
  margin="dense"
  label="Transaction/UTR ID"
  type="text"
  fullWidth
  variant="outlined"
  value={transactionId}
  onChange={(e) => setTransactionId(e.target.value)}
  InputLabelProps={{
    style: { color: "#ffd700" },
  }}
  sx={{
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#ffd700",
      },
      "&:hover fieldset": {
        borderColor: "#ffb400",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#ffa500",
      },
    },
  }}
/>

                    <Button
                      type="submit"
                      color="primary"
                      variant="contained"
                      style={{ marginTop: "10px" }}
                      disabled={isLoading} // Disable while loading
                    >
                      {isLoading ? "Submitting..." : "Submit"}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleClose}
                      color="secondary"
                      style={{ marginTop: "10px" }}
                      disabled={isLoading} // Disable while loading
                    >
                      Cancel
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>

          <div className="show-more" onClick={handleShowMore}>
            Show more
          </div>

          <div className="Payment-buttons" onClick={handleDone}>
            Completed Payment
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentComponent;
