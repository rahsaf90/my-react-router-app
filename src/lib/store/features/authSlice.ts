import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { apiLogin, apiLogout, apiSessionRefresh, apiCSRF } from '~/lib/providers/auth';
import type { IUserAuth } from '~/lib/types/common';
import { SESSION_TIMEOUT } from '../constants';
import moment from 'moment';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (user: IUserAuth) => {
    return await apiLogin(user);
  },
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    return await apiLogout();
  },
);

export const refreshSession = createAsyncThunk(
  'auth/refreshSession',
  async () => {
    // Implement session refresh logic here if needed
    // For now, we can return a dummy object or handle it as per your requirements
    return await apiSessionRefresh();
  },
);

export const getCSRF = createAsyncThunk(
  'auth/getCSRF',
  async () => {
    return await apiCSRF();
  },
);

interface AuthState {
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
  isAuthenticated: boolean;
  sessionExpiry: string | Date | null;
}

const initialState: AuthState = {
  status: 'idle',
  error: null,
  isAuthenticated: false,
  sessionExpiry: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  selectors: {
    isAuthenticated: (state: AuthState) => state.isAuthenticated,
    sessionDate: (state: AuthState) => state.sessionExpiry === null ? null : moment(state.sessionExpiry),
    authStatus: (state: AuthState) => state.status,
    isSessionExpired: (state: AuthState) => {
      if (!state.sessionExpiry) return true;
      return moment().isAfter(moment(state.sessionExpiry));
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      },
      )
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = action.payload ?? false; // Assuming payload is a boolean indicating success
        state.error = null;
        state.sessionExpiry = moment().add(SESSION_TIMEOUT, 'millisecond').toDate(); // Set session expiry based on SESSION_TIMEOUT constant
      },
      ).addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Login failed';
        state.isAuthenticated = false;
        state.sessionExpiry = null; // Reset session expiry on failure
      },
      )
      .addCase(logoutUser.fulfilled, () => {
        return initialState; // Reset state on logout
      },
      ).addCase(refreshSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.sessionExpiry = moment().add(action.payload.expiry_age, 'seconds').toDate();
          state.error = null;
          state.isAuthenticated = true; // Assuming session refresh keeps the user authenticated
        }
        else {
          state.isAuthenticated = false; // If session refresh fails, set authenticated to false
          state.sessionExpiry = null; // Reset session expiry
        }
      },
      ).addCase(refreshSession.rejected, (state, action) => {
        state.error = action.error.message ?? 'Session refresh failed';
        state.isAuthenticated = false; // If session refresh fails, set authenticated to false
        state.sessionExpiry = null; // Reset session expiry
      },
      );
  },
});
export const { isAuthenticated, sessionDate, authStatus, isSessionExpired } = authSlice.selectors;
export default authSlice.reducer;
