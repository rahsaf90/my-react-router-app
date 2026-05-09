/**
 * Shared test utilities for the application.
 * Provides a custom render wrapper with Redux store and
 * factory helpers for commonly used data shapes.
 */
import { configureStore } from '@reduxjs/toolkit';
import { render, type RenderOptions } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { apiBase } from '~/lib/store/features/apiBase';
import AuthSlice from '~/lib/store/features/authSlice';
import CounterSlice from '~/lib/store/features/counterSlice';
import uiSlice from '~/lib/store/features/uiSlice';
import type { IUser } from '~/lib/types/auth';
import type { IStatsBoxData } from '~/lib/types/common';

export function makeTestStore(preloadedState?: Record<string, unknown>) {
  return configureStore({
    reducer: {
      [apiBase.reducerPath]: apiBase.reducer,
      ui: uiSlice,
      counter: CounterSlice,
      auth: AuthSlice,
    },
    middleware: gDM => gDM().concat(apiBase.middleware),
    preloadedState,
  });
}

interface WrapperProps {
  store?: ReturnType<typeof makeTestStore>
}

function AllProviders({
  children,
  store,
}: React.PropsWithChildren<WrapperProps>) {
  const s = store ?? makeTestStore();
  return <Provider store={s}>{children}</Provider>;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions & WrapperProps,
) {
  const { store, ...renderOptions } = options ?? {};
  return {
    store,
    ...render(ui, {
      wrapper: ({ children }) => (
        <AllProviders store={store}>{children}</AllProviders>
      ),
      ...renderOptions,
    }),
  };
}

// ─── Data factories ──────────────────────────────────────────────────────────

export function makeUser(overrides?: Partial<IUser>): IUser {
  return {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    full_name: 'Test User',
    is_active: true,
    first_name: 'Test',
    last_name: 'User',
    ...overrides,
  };
}

export function makeStatsBoxData(
  overrides?: Partial<IStatsBoxData>,
): IStatsBoxData {
  return {
    name: 'Draft',
    value: 5,
    color: '#ccc',
    icon: 'Draft',
    loading: false,
    ...overrides,
  };
}
