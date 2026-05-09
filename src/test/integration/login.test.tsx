/**
 * Integration test: Login user flow
 *
 * Tests the complete login experience:
 * - User fills in username and password
 * - Submits the form
 * - Sees validation errors if invalid
 * - Sees success/error snackbar messages
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import LoginForm from '~/app/pages/_auth/login/form';
import { server } from '../mocks/server';
import { renderWithProviders } from '../utils';

// Start MSW server for all tests in this file
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Login integration – user flow', () => {
  it('user can fill in credentials and see validation errors on blur', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    // Username field: type something, then clear to trigger validation
    const usernameInput = screen.getByLabelText(/username or email/i);
    await user.type(usernameInput, 'test');
    await user.clear(usernameInput); // triggers onChange validation
    await waitFor(
      () => {
        expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it('user can toggle password visibility', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    const passwordInput = screen.getByLabelText(/^password/i);
    const toggleButton = screen.getByRole('button', { name: /visibility|show|hide/i });

    // Initially type is "password"
    expect(passwordInput.type).toBe('password');

    // Click toggle to show password
    await user.click(toggleButton);
    expect(passwordInput.type).toBe('text');

    // Click toggle to hide password again
    await user.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('user can successfully log in with valid credentials', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    // Fill in credentials
    await user.type(screen.getByLabelText(/username or email/i), 'testuser');
    await user.type(screen.getByLabelText(/^password/i), 'password123');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /log.?in/i });
    await user.click(submitButton);

    // Wait for success snackbar (proves login succeeded and redirect was called)
    await waitFor(() => {
      expect(screen.getByText(/login successful/i)).toBeInTheDocument();
    });
  });

  it('user sees error snackbar on login failure', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    // Fill in with wrong password
    await user.type(screen.getByLabelText(/username or email/i), 'testuser');
    await user.type(screen.getByLabelText(/^password/i), 'wrongpassword');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /log.?in/i });
    await user.click(submitButton);

    // Wait for error snackbar
    await waitFor(() => {
      expect(screen.getByText(/login failed/i)).toBeInTheDocument();
    });

    // Verify error styling on fields
    const usernameInput = screen.getByLabelText(/username or email/i);
    const passwordInput = screen.getByLabelText(/^password/i);

    // Both fields should have aria-invalid="true" after error
    await waitFor(() => {
      expect(usernameInput.getAttribute('aria-invalid')).toBe('true');
      expect(passwordInput.getAttribute('aria-invalid')).toBe('true');
    });
  });

  it('submit button is disabled until form is valid', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    const submitButton = screen.getByRole('button', {
      name: /log.?in/i,
    });

    // Button starts disabled because form is empty
    expect(submitButton).toBeDisabled();

    // Fill form with valid data
    await user.type(screen.getByLabelText(/username or email/i), 'testuser');
    await user.type(screen.getByLabelText(/^password/i), 'password123');

    // Now button should be enabled
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('password min length validation is enforced', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    const passwordInput = screen.getByLabelText(/^password/i);

    // Type a short password
    await user.type(passwordInput, 'abc');
    await user.tab(); // trigger validation

    // Should show min length error
    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 6 characters/i),
      ).toBeInTheDocument();
    });
  });
});
