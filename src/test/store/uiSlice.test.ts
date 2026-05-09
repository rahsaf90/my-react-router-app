import { describe, expect, it } from 'vitest';
import uiReducer, {
    closeDrawer,
    openDrawer,
    toggleDrawer,
} from '~/lib/store/features/uiSlice';

const initialState = { isDrawerOpen: false };

describe('uiSlice', () => {
  it('returns the initial state', () => {
    expect(uiReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('toggleDrawer opens a closed drawer', () => {
    const state = uiReducer(initialState, toggleDrawer());
    expect(state.isDrawerOpen).toBe(true);
  });

  it('toggleDrawer closes an open drawer', () => {
    const openState = { isDrawerOpen: true };
    const state = uiReducer(openState, toggleDrawer());
    expect(state.isDrawerOpen).toBe(false);
  });

  it('openDrawer sets isDrawerOpen to true', () => {
    const state = uiReducer(initialState, openDrawer());
    expect(state.isDrawerOpen).toBe(true);
  });

  it('openDrawer is idempotent when drawer is already open', () => {
    const openState = { isDrawerOpen: true };
    const state = uiReducer(openState, openDrawer());
    expect(state.isDrawerOpen).toBe(true);
  });

  it('closeDrawer sets isDrawerOpen to false', () => {
    const openState = { isDrawerOpen: true };
    const state = uiReducer(openState, closeDrawer());
    expect(state.isDrawerOpen).toBe(false);
  });

  it('closeDrawer is idempotent when drawer is already closed', () => {
    const state = uiReducer(initialState, closeDrawer());
    expect(state.isDrawerOpen).toBe(false);
  });
});
