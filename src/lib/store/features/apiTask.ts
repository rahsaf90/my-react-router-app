import type { IAPIListResponse, IStatsBoxData } from '~/lib/types/common';
import type { IKycTask } from '~/lib/types/tasks';
import { apiBase } from './apiBase';

const extendedAPITask = apiBase.enhanceEndpoints({
  addTagTypes: ['Tasks', 'TaskStats'] }).injectEndpoints({
  endpoints: builder => ({
    getTaskStats: builder.query<IStatsBoxData[], void>({
      query: () => 'tasks/stats/',
      providesTags: ['TaskStats'],
    }),
    getTasks: builder.query<
      IAPIListResponse<IKycTask>,
      { page: number, limit: number, task_filter: string }
    >({
      query: ({ page = 1, limit = 20, task_filter }) =>
        `tasks/?offset=${(page - 1) * limit}`
        + `&limit=${limit}`
        + `&task_filter=${task_filter}`,
      providesTags: response =>
        response
          ? response.results.map(({ id }) => ({ type: 'Tasks', id }))
          : [{ type: 'Tasks' }],
    }),
    getTask: builder.query<IKycTask, string>({
      query: id => `tasks/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Tasks', id }],
    }),
  }),
  overrideExisting: false,
});
export const { useGetTaskStatsQuery, useGetTasksQuery, useGetTaskQuery } = extendedAPITask;
