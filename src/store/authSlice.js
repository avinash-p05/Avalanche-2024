// src/store/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { encryptData, decryptData } from "../utility/encryption";

// Check if encrypted token exists and decrypt it
const encryptedToken = localStorage.getItem("encryptedToken");
const encryptedUser = localStorage.getItem("encryptedUser");

const initialToken = encryptedToken ? decryptData(encryptedToken) : null;
const initialUser = encryptedUser ? decryptData(encryptedUser) : null;

export const signup = createAsyncThunk(
  "api/v1/auth/signup",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetch("api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Signup failed");
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const login = createAsyncThunk(
  "api/v1/auth/login",
  async ({ email, password, captchaToken }, { rejectWithValue }) => {
    try {
      const response = await fetch("api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, captchaToken }), // Include captchaToken here
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// New action to update payment status
// Updated action to update payment status with transactionId and amount
export const updatePaymentStatus = createAsyncThunk(
  "api/v1/auth/updatePaymentStatus",
  async ({ userId, transactionId, amount }, { rejectWithValue, getState }) => {
    try {
      const response = await fetch("api/v1/team/payment/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, transactionId, amount }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Payment update failed");

      // Update the user data with the new payment status
      const updatedUser = {
        ...getState().auth.user,
        paymentStatus: "completed",
      };
      return updatedUser;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: initialUser,
    loading: false,
    error: null,
    isAuthenticated: Boolean(initialToken),
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("encryptedToken");
      localStorage.removeItem("encryptedUser");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;

        const encryptedToken = encryptData(action.payload.token);
        const encryptedUser = encryptData(action.payload.user);

        if (encryptedToken && encryptedUser) {
          localStorage.setItem("encryptedToken", encryptedToken);
          localStorage.setItem("encryptedUser", encryptedUser);
        }
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;

        const encryptedToken = encryptData(action.payload.token);
        const encryptedUser = encryptData(action.payload.user);

        if (encryptedToken && encryptedUser) {
          localStorage.setItem("encryptedToken", encryptedToken);
          localStorage.setItem("encryptedUser", encryptedUser);
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle payment status update
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.user = action.payload;

        const encryptedUser = encryptData(action.payload);
        if (encryptedUser) {
          localStorage.setItem("encryptedUser", encryptedUser);
        }
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export default authSlice.reducer;
