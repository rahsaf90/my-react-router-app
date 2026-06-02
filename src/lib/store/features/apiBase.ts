import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_API } from '~/lib/envConfig';

// Ensure BASE_API is a string
const baseApiUrl: string = BASE_API as string;

export const apiBase = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: baseApiUrl,
    credentials: 'include',
    // NOTE: do not force a global `Content-Type` header. `fetchBaseQuery`
    // automatically sets `application/json` for plain-object bodies and
    // leaves `FormData` bodies untouched so the browser can set the
    // correct multipart boundary (required for TaskDocument file uploads).
  }),
  endpoints: () => ({}),
});
