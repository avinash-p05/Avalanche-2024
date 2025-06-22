import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Alert,
} from "@mui/material";
const VerifyAccount = () => {
  const { token } = useParams();
  const [verificationStatus, setVerificationStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(
          `api/v1/auth/verify-email/${token}`
        );
        setVerificationStatus(response.data.message);
      } catch (error) {
        setError(
          error.response?.data?.error ||
            "Verification failed. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        {loading ? (
          <CircularProgress />
        ) : (
          <Box textAlign="center">
            <Typography variant="h4" style={{ color: "white" }} gutterBottom>
              Account Verification
            </Typography>
            {verificationStatus && (
              <Alert severity="success">{verificationStatus}</Alert>
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default VerifyAccount;
