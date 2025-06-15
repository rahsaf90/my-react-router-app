import type { IUser } from '~/lib/types/auth';
import { apiBase } from './apiBase';

const extendedApi = apiBase.enhanceEndpoints({
  addTagTypes: ['User'] }).injectEndpoints({
  endpoints: builder => ({
    getCurrentUser: builder.query<IUser, void>({
      query: () => '/users/current/',
      keepUnusedDataFor: 60 * 10, // 10 minutes cache
      providesTags: result =>
        result ? [{ type: 'User', id: result.id }] : [{ type: 'User' }],
    }),
  }),
  overrideExisting: true,
});
export const { useGetCurrentUserQuery } = extendedApi;
