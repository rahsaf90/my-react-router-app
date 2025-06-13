export const BASE_API = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000/api';
export const TOKEN_EXPIRY = 1 / 24; // 1 hour in days
export const REFRESH_TOKEN_EXPIRY = 7; // 7 days in days
export const ADMIN_URL = import.meta.env.VITE_ADMIN_URL ?? 'http://localhost:3000/admin';
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
export const WIKI_URL = import.meta.env.VITE_WIKI_URL ?? 'https://wiki.example.com';
