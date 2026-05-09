/**
 * MSW request handlers for auth API endpoints.
 * Used to mock the backend in tests.
 */
import { http, HttpResponse } from 'msw';
import { BASE_API } from '~/lib/envConfig';

export const authHandlers = [
  // CSRF token endpoint
  http.get(`${BASE_API}/auth/csrf/`, () => {
    return new HttpResponse(null, {
      headers: {
        'X-CSRFToken': 'test-csrf-token-12345',
      },
    });
  }),

  // Login endpoint
  http.post(`${BASE_API}/auth/login/`, async ({ request }) => {
    const body = await request.json() as { username: string, password: string };

    // Simulate validation: reject if password is wrong
    if (body.password === 'wrongpassword') {
      return HttpResponse.json(
        { detail: 'Invalid credentials' },
        { status: 401 },
      );
    }

    // Success: return 200 (actual response body doesn't matter for this test)
    return HttpResponse.json({}, { status: 200 });
  }),

  // Logout endpoint
  http.post(`${BASE_API}/auth/logout/`, () => {
    return HttpResponse.json({}, { status: 200 });
  }),

  // Session refresh endpoint
  http.get(`${BASE_API}/auth/refresh/`, () => {
    return HttpResponse.json(
      {
        detail: 'ok',
        expiry_age: 3600,
        expiry_date: new Date(Date.now() + 3600000).toISOString(),
      },
      { status: 200 },
    );
  }),
];
