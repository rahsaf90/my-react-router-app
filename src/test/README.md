# Testing Guide

## Stack

| Tool | Purpose |
|---|---|
| **Vitest** | Test runner — native Vite integration, fast HMR re-runs |
| **@testing-library/react** | Component rendering and DOM assertions |
| **@testing-library/jest-dom** | Extra DOM matchers (`toBeInTheDocument`, `toHaveClass`, etc.) |
| **MSW** | API mocking (installed, ready for integration tests) |
| **@vitest/coverage-v8** | Istanbul-compatible coverage reports |

---

## NPM Scripts

| Command | Purpose |
|---|---|
| `npm test` | Single run — use in CI |
| `npm run test:watch` | Watch mode — use during development |
| `npm run test:coverage` | Generates HTML + lcov coverage report under `coverage/` |

---

## Configuration Files

| File | Purpose |
|---|---|
| `vitest.config.ts` | Vitest config — jsdom environment, path aliases, coverage settings |
| `src/test/setup.ts` | Global setup — imports `@testing-library/jest-dom` matchers |

---

## Test Structure

```
src/test/
├── setup.ts                        # Global jest-dom matchers
├── utils.tsx                       # Shared helpers: renderWithProviders, makeStore, data factories
├── store/
│   ├── authSlice.test.ts           # Auth thunks + selectors
│   ├── counterSlice.test.ts        # Counter reducer actions
│   └── uiSlice.test.ts             # Drawer reducer actions
├── utils/
│   ├── dates.test.ts               # Date formatting utilities
│   ├── general.test.ts             # slugify, formatDate
│   ├── users.test.ts               # stringAvatar edge cases
│   └── yupGenerator.test.ts        # Dynamic Yup schema generation
├── components/
│   └── StatusBox.test.tsx          # StatusBox rendering and CSS class logic
├── integration/
│   └── login.test.tsx              # Login user flow with MSW mocking
└── mocks/
    ├── handlers.ts                 # MSW request handlers for API endpoints
    └── server.ts                   # MSW server instance
```

---

## Test Files at a Glance

### `src/test/store/uiSlice.test.ts` — 7 tests
Covers `toggleDrawer`, `openDrawer`, `closeDrawer` reducers including idempotency.

### `src/test/store/counterSlice.test.ts` — 8 tests
Covers `increment`, `decrement`, `incrementByAmount` including negative values and zero.

### `src/test/store/authSlice.test.ts` — 15 tests
- `loginUser` thunk: pending, fulfilled (true/false payload), rejected (with/without message)
- `logoutUser` thunk: state reset on success
- `refreshSession` thunk: expiry update, falsy payload, rejected
- Selectors: `isAuthenticated`, `authStatus`, `isSessionExpired` (null, past, future)

### `src/test/utils/general.test.ts` — 13 tests
`slugify`: spaces, casing, special chars, multiple hyphens, trim, empty string, numbers.  
`formatDate`: Date object and ISO string inputs.

### `src/test/utils/dates.test.ts` — 14 tests
`datetimeISO`, `dateFormat`, `localDateFormat`, `localDateTimeFormat` (null/undefined/valid), `daysFrom` (null, today, past date).

### `src/test/utils/users.test.ts` — 6 tests
`stringAvatar`: undefined user, both names, uppercasing, missing first name, missing last name, both missing.

### `src/test/utils/yupGenerator.test.ts` — 12 tests
`generateYupSchema` with:
- `text` field: required, min length, max length, email format, custom regex pattern
- `number` field: required, min value
- `select` field: required, empty value rejection
- Multi-model: separate nested object per `model_name`

###Integration Tests — User Flows

### `src/test/integration/login.test.tsx` — 6 tests
End-to-end test of the login form with real Redux state and mocked API:

| Test | What it verifies |
|---|---|
| Can fill in credentials & see validation errors | Form validation on user input (type → clear → error appears) |
| Can toggle password visibility | Icon button switches password field between hidden/visible |
| Can successfully log in | Valid credentials + API success + success snackbar appears |
| User sees error snackbar on failure | Invalid credentials + API 401 + error snackbar + field styling |
| Submit button disabled until form valid | Button state changes as form validity changes |
| Password min length validation enforced | Less than 6 characters triggers validation error |

**Setup:**
- Uses MSW to mock `/api/auth/*` endpoints
- `renderWithProviders` renders form in Redux context
- All HTTP calls intercepted at network level (no real backend needed)

### Unit Testing
- **Unit isolation** — reducer tests dispatch action creators directly; no real HTTP calls
- **Data factories** — keep test setup DRY and readable
- **Edge cases** — null/undefined inputs, boundary values, falsy payloads always covered
- **RTK awareness** — tests reflect actual Redux Toolkit behaviour (e.g. RTK sets `error.message = 'Rejected'` when `null` is passed to a rejected action creator)
- **No over-mocking** — pure functions tested without mocks; async thunks tested by dispatching fulfilled/rejected action creators directly

### Integration Testing (User Flows)
- **MSW for API mocking** — Intercepts HTTP calls at network level; prevents real backend calls, allows testing error scenarios
- **userEvent over fireEvent** — `userEvent` simulates realistic browser interactions (full event sequences: focus, input, blur); `fireEvent` is too low-level
- **Accessible queries** — Use `getByRole`, `getByLabelText` instead of `getByTestId` or class selectors; forces semantic HTML
- **waitFor for async** — Always use `waitFor` to assert async state changes (API responses, validation errors, snackbars)
- **renderWithProviders** — Wraps components in Redux provider with test store; all slices and middleware available

---

## Pattern Examples

### Query by Label (MUI TextField)
```typescript
const usernameInput = screen.getByLabelText(/username or email/i);
await user.type(usernameInput, 'testuser');
```

### Query by Button Text
```typescript
const submitButton = screen.getByRole('button', { name: /log.?in/i });
await user.click(submitButton);
```

### Wait for Async State
```typescript
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});
```

### Customize MSW Handler Per Test
```typescript
server.use(
  http.post(`${BASE_API}/auth/login/`, () => {
    return HttpResponse.json({ detail: 'Server error' }, { status: 500 });
  }),
);
```

---

## Copy-Paste Template for New Integration Tests

```typescript
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '../mocks/server';
import { renderWithProviders } from '../utils';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('My Feature Flow', () => {
  it('user can complete happy path', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MyComponent />);

    // User action
    await user.type(screen.getByLabelText(/field/i), 'value');
    
    // Verify result
    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });
});
```

---

## Key PracticesGET /auth/csrf/` — Returns CSRF token in `X-CSRFToken` header
- `POST /auth/login/` — Validates username/password; rejects if `password === 'wrongpassword'`
- `POST /auth/logout/` — Returns 200 OK
- `GET /auth/refresh/` — Returns new session expiry time

Handlers can be customized per-test with `server.use()` to test error scenarios.

### `src/test/mocks/server.ts`
MSW server instance initialized in test setup (`beforeAll`), reset after each test (`afterEach`), and closed on suite completion (`afterAll`).

---

##  `src/test/components/StatusBox.test.tsx` — 6 tests
Renders item name, renders item value, applies slugified CSS class (`in-progress`, `draft`, `approved`), renders zero value.

---

## Shared Test Utilities (`src/test/utils.tsx`)

### `makeTestStore(preloadedState?)`
Creates a fully configured Redux store with all reducers and RTK Query middleware. Accepts optional preloaded state for testing specific scenarios.

### `renderWithProviders(ui, options?)`
Wraps a component in a Redux `<Provider>` with a test store. Returns all Testing Library queries plus the store reference.

### Data Factories

| Factory | Returns |
|---|---|
| `makeUser(overrides?)` | `IUser` with sensible defaults |
| `makeStatsBoxData(overrides?)` | `IStatsBoxData` with sensible defaults |

---

## Key Practices

- **Unit isolation** — reducer tests dispatch action creators directly; no real HTTP calls
- **Data factories** — keep test setup DRY and readable
- **Edge cases** — null/undefined inputs, boundary values, falsy payloads always covered
- **RTK awareness** — tests reflect actual Redux Toolkit behaviour (e.g. RTK sets `error.message = 'Rejected'` when `null` is passed to a rejected action creator)
- **No over-mocking** — pure functions tested without mocks; async thunks tested by dispatching fulfilled/rejected action creators directly

---

## Running Tests with Node 20

The project requires Node ≥ 18 (Vitest 4 dependency). If your shell defaults to an older version, prefix commands with:

```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
npm test
```

Or add the export to your shell profile to make it permanent.
