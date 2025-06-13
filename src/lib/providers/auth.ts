import type { IAuthSessionRefresh, IUserAuth } from '../types/common';

import { BASE_API } from '../envConfig';

export async function apiCSRF() {
  const response = await fetch(`${BASE_API}/auth/csrf/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch CSRF token');
  }

  const data = response.headers.get('X-CSRFToken');
  if (!data) {
    throw new Error('CSRF token not found in response headers');
  }
  return data;
}
export async function apiLogin({ username, password }: IUserAuth): Promise<boolean> {
  const csrf = await apiCSRF();
  const loginURL = `${BASE_API}/auth/login/`;
  const response = await fetch(loginURL, {

    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrf,
    },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    throw new Error('Login failed');
  }

  return true;
}

export async function apiLogout(): Promise<void> {
  const logoutURL = `${BASE_API}/auth/logout/`;
  const response = await fetch(logoutURL, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }
}

export async function apiSessionRefresh(): Promise<IAuthSessionRefresh> {
  const refreshURL = `${BASE_API}/auth/refresh/`;
  const response = await fetch(refreshURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Session refresh failed');
  }

  return response.json() as unknown as IAuthSessionRefresh;
}
