/**
 * MSW server setup for integration tests.
 * Use setupServer() for Node.js/test environment.
 */
import { setupServer } from 'msw/node';
import { authHandlers } from './handlers';

export const server = setupServer(...authHandlers);
