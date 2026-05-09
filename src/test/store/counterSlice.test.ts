import { describe, expect, it } from 'vitest';
import counterReducer, {
    decrement,
    increment,
    incrementByAmount,
} from '~/lib/store/features/counterSlice';

const initialState = { value: 0 };

describe('counterSlice', () => {
  it('returns the initial state', () => {
    expect(counterReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('increment adds 1 to the counter', () => {
    const state = counterReducer(initialState, increment());
    expect(state.value).toBe(1);
  });

  it('increment accumulates correctly', () => {
    let state = counterReducer(initialState, increment());
    state = counterReducer(state, increment());
    expect(state.value).toBe(2);
  });

  it('decrement subtracts 1 from the counter', () => {
    const state = counterReducer({ value: 5 }, decrement());
    expect(state.value).toBe(4);
  });

  it('decrement can produce negative values', () => {
    const state = counterReducer(initialState, decrement());
    expect(state.value).toBe(-1);
  });

  it('incrementByAmount adds the given amount', () => {
    const state = counterReducer(initialState, incrementByAmount(10));
    expect(state.value).toBe(10);
  });

  it('incrementByAmount works with negative amounts', () => {
    const state = counterReducer({ value: 5 }, incrementByAmount(-3));
    expect(state.value).toBe(2);
  });

  it('incrementByAmount works with zero', () => {
    const state = counterReducer({ value: 7 }, incrementByAmount(0));
    expect(state.value).toBe(7);
  });
});
