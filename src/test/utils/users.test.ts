import { describe, expect, it } from 'vitest';
import { stringAvatar } from '~/lib/utils/users';
import { makeUser } from '../utils';

describe('stringAvatar', () => {
  it('returns "--" when user is undefined', () => {
    expect(stringAvatar(undefined)).toEqual({ children: '--' });
  });

  it('returns initials for a user with first and last name', () => {
    const user = makeUser({ first_name: 'Jane', last_name: 'Doe' });
    expect(stringAvatar(user)).toEqual({ children: 'JD' });
  });

  it('returns uppercased initials', () => {
    const user = makeUser({ first_name: 'alice', last_name: 'bob' });
    expect(stringAvatar(user)).toEqual({ children: 'AB' });
  });

  it('returns single initial when last name is missing', () => {
    const user = makeUser({ first_name: 'Jane', last_name: undefined });
    expect(stringAvatar(user)).toEqual({ children: 'J' });
  });

  it('returns single initial when first name is missing', () => {
    const user = makeUser({ first_name: undefined, last_name: 'Doe' });
    expect(stringAvatar(user)).toEqual({ children: 'D' });
  });

  it('returns empty string children when both names are missing', () => {
    const user = makeUser({ first_name: undefined, last_name: undefined });
    expect(stringAvatar(user)).toEqual({ children: '' });
  });
});
