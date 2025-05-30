import { createSlice } from '@reduxjs/toolkit';

// UI slice to manage the state of the UI components
export const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isDrawerOpen: false,
  },
  reducers: {
    toggleDrawer: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
    openDrawer: (state) => {
      state.isDrawerOpen = true;
    },
    closeDrawer: (state) => {
      state.isDrawerOpen = false;
    },
  },
});
export const { toggleDrawer, openDrawer, closeDrawer } = uiSlice.actions;
export default uiSlice.reducer;
