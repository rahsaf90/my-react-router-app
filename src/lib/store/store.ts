import { configureStore } from '@reduxjs/toolkit';
import { apiBase } from './features/apiBase';

import AuthSlice from './features/authSlice';
import CounterSlice from './features/counterSlice';
import uiSlice from './features/uiSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      [apiBase.reducerPath]: apiBase.reducer,
      ui: uiSlice,
      counter: CounterSlice, // Include the counter slice reducer

      auth: AuthSlice,
      // Add your reducers here
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware().concat(apiBase.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
