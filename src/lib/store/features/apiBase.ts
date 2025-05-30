import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_API } from '~/lib/envConfig';

// Ensure BASE_API is a string
const baseApiUrl: string = BASE_API as string;

const headers = { 'Content-Type': 'application/json' };

export const apiBase = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: baseApiUrl,
    headers,
    credentials: 'include',
  }),
  endpoints: () => ({}),
});
