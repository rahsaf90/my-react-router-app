import { configureStore } from '@reduxjs/toolkit';
import { apiBase } from './features/apiBase';
import CounterSlice from './features/counterSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      [apiBase.reducerPath]: apiBase.reducer,
      counter: CounterSlice, // Include the counter slice reducer
      // Add your reducers here
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware().concat(apiBase.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
