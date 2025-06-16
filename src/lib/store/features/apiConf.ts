import type { IFrmTmpl } from '~/lib/types/conf';
import type { IAPIListResponse } from './../../types/common.d';
import { apiBase } from './apiBase';

const extendedApi = apiBase.enhanceEndpoints({
  addTagTypes: ['FrmTmpl', 'FrmTmplByType'] }).injectEndpoints({
  endpoints: builder => ({
    getFormTemplates: builder.query<IAPIListResponse<IFrmTmpl>, void>({
      query: () => '/frmtmpls/',
      keepUnusedDataFor: 60 * 60, // 1 hour cache
      providesTags: response =>
        response
          ? response.results.map(({ id }) => ({ type: 'FrmTmpl', id }))
          : [{ type: 'FrmTmpl' }],
    }),
    getFormTemplate: builder.query<IFrmTmpl, number>({
      query: id => '/frmtmpls/' + id + '/',
      keepUnusedDataFor: 60 * 60, // 1 hour cache
      providesTags: (result, error, id) => [{ type: 'FrmTmpl', id }],
    }),
    getFormTmplLatest: builder.query<IFrmTmpl, { task_type: string }>({
      query: ({ task_type }) => '/frmtmpls/latest/?task_type=' + task_type,
      keepUnusedDataFor: 60 * 60, // 1 hour cache
      providesTags: (result, error, arg) => [{ type: 'FrmTmplByType', id: arg.task_type }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetFormTemplatesQuery,
  useGetFormTmplLatestQuery,
  useLazyGetFormTmplLatestQuery,
  useGetFormTemplateQuery,
  useLazyGetFormTemplateQuery,
} = extendedApi;
