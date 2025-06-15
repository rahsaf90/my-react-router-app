import type { IUser } from './../types/auth.d';
export function stringAvatar(user: IUser | undefined) {
  if (user === undefined) return { children: '--' };
  const firstName = user.first_name ?? '';
  const lastName = user.last_name ?? '';
  return {
    children: `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`,
  };
}
