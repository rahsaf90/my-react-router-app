import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, it } from 'vitest';
import { SESSION_TIMEOUT } from '~/lib/store/constants';
import authReducer, {
    authStatus,
    isAuthenticated,
    isSessionExpired,
    loginUser,
    logoutUser,
    refreshSession,
} from '~/lib/store/features/authSlice';

// Minimal store factory for auth-only testing
function makeStore(preloaded?: Parameters<typeof configureStore>[0]['preloadedState']) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: preloaded,
  });
}

// ─── Reducer: initial state ──────────────────────────────────────────────────

describe('authSlice reducer – initial state', () => {
  it('starts unauthenticated with idle status', () => {
    const store = makeStore();
    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.status).toBe('idle');
    expect(state.error).toBeNull();
    expect(state.sessionExpiry).toBeNull();
  });
});

// ─── Reducer: loginUser thunk ────────────────────────────────────────────────

describe('authSlice reducer – loginUser', () => {
  it('sets status to pending when loginUser is pending', () => {
    const action = loginUser.pending('req-id', { username: 'u', password: 'p' });
    const state = authReducer(undefined, action);
    expect(state.status).toBe('pending');
    expect(state.error).toBeNull();
  });

  it('sets isAuthenticated and sessionExpiry when loginUser succeeds (payload = true)', () => {
    const before = Date.now();
    const action = loginUser.fulfilled(true, 'req-id', { username: 'u', password: 'p' });
    const state = authReducer(undefined, action);
    expect(state.status).toBe('succeeded');
    expect(state.isAuthenticated).toBe(true);
    expect(state.error).toBeNull();
    expect(state.sessionExpiry).not.toBeNull();

    // sessionExpiry should be approximately now + SESSION_TIMEOUT
    const expiry = new Date(state.sessionExpiry as string).getTime();
    expect(expiry).toBeGreaterThanOrEqual(before + SESSION_TIMEOUT - 1000);
    expect(expiry).toBeLessThanOrEqual(Date.now() + SESSION_TIMEOUT + 1000);
  });

  it('sets isAuthenticated to false when loginUser fulfills with falsy payload', () => {
    const action = loginUser.fulfilled(false, 'req-id', { username: 'u', password: 'p' });
    const state = authReducer(undefined, action);
    expect(state.isAuthenticated).toBe(false);
  });

  it('sets status to failed and error message when loginUser is rejected', () => {
    const action = loginUser.rejected(
      new Error('Invalid credentials'),
      'req-id',
      { username: 'u', password: 'p' },
    );
    const state = authReducer(undefined, action);
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Invalid credentials');
    expect(state.isAuthenticated).toBe(false);
    expect(state.sessionExpiry).toBeNull();
  });

  it('uses RTK default "Rejected" message when loginUser is rejected with null error', () => {
    // RTK always sets action.error.message = 'Rejected' when null is passed,
    // so the ?? 'Login failed' fallback in the reducer is never reached via this path.
    const action = loginUser.rejected(null, 'req-id', { username: 'u', password: 'p' });
    const state = authReducer(undefined, action);
    expect(state.error).toBe('Rejected');
  });
});

// ─── Reducer: logoutUser thunk ───────────────────────────────────────────────

describe('authSlice reducer – logoutUser', () => {
  it('resets state to initial when logoutUser succeeds', () => {
    const authenticatedPreloaded = {
      auth: {
        status: 'succeeded' as const,
        error: null,
        isAuthenticated: true,
        sessionExpiry: new Date(Date.now() + 3600000).toISOString(),
      },
    };
    const store = makeStore(authenticatedPreloaded);

    // Simulate fulfilled logout action
    store.dispatch(logoutUser.fulfilled(undefined, 'req-id'));
    const state = store.getState().auth;

    expect(state.isAuthenticated).toBe(false);
    expect(state.status).toBe('idle');
    expect(state.sessionExpiry).toBeNull();
    expect(state.error).toBeNull();
  });
});

// ─── Reducer: refreshSession thunk ──────────────────────────────────────────

describe('authSlice reducer – refreshSession', () => {
  it('updates sessionExpiry and keeps authenticated when session refresh succeeds', () => {
    const payload = {
      detail: 'ok',
      expiry_age: 3600, // seconds
      expiry_date: new Date().toISOString(),
    };
    const action = refreshSession.fulfilled(payload, 'req-id');
    const before = Date.now();
    const state = authReducer(undefined, action);

    expect(state.isAuthenticated).toBe(true);
    expect(state.error).toBeNull();
    const expiry = new Date(state.sessionExpiry as string).getTime();
    expect(expiry).toBeGreaterThanOrEqual(before + 3600 * 1000 - 1000);
  });

  it('sets isAuthenticated to false when refreshSession fulfills with falsy payload', () => {
    const action = refreshSession.fulfilled(null as never, 'req-id');
    const state = authReducer(undefined, action);
    expect(state.isAuthenticated).toBe(false);
    expect(state.sessionExpiry).toBeNull();
  });

  it('sets isAuthenticated to false when refreshSession is rejected', () => {
    const action = refreshSession.rejected(new Error('expired'), 'req-id');
    const state = authReducer(undefined, action);
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe('expired');
    expect(state.sessionExpiry).toBeNull();
  });
});

// ─── Selectors ───────────────────────────────────────────────────────────────

describe('authSlice selectors', () => {
  it('isAuthenticated selector reflects state', () => {
    const store = makeStore({
      auth: {
        status: 'succeeded',
        error: null,
        isAuthenticated: true,
        sessionExpiry: new Date(Date.now() + 3600000).toISOString(),
      },
    });
    expect(isAuthenticated(store.getState())).toBe(true);
  });

  it('authStatus selector returns current status', () => {
    const store = makeStore();
    expect(authStatus(store.getState())).toBe('idle');
  });

  it('isSessionExpired returns true when sessionExpiry is null', () => {
    const store = makeStore();
    expect(isSessionExpired(store.getState())).toBe(true);
  });

  it('isSessionExpired returns false for a future expiry', () => {
    const store = makeStore({
      auth: {
        status: 'succeeded',
        error: null,
        isAuthenticated: true,
        sessionExpiry: new Date(Date.now() + 3600000).toISOString(),
      },
    });
    expect(isSessionExpired(store.getState())).toBe(false);
  });

  it('isSessionExpired returns true for a past expiry', () => {
    const store = makeStore({
      auth: {
        status: 'succeeded',
        error: null,
        isAuthenticated: true,
        sessionExpiry: new Date(Date.now() - 1000).toISOString(),
      },
    });
    expect(isSessionExpired(store.getState())).toBe(true);
  });
});
