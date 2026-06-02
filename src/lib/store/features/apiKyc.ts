import type { IAPIListResponse } from '~/lib/types/common';
import type {
  ICoreProfile,
  ICoreProfileCreate,
  ICountry,
  ICusAccount,
  ICusAccountCreate,
  ICustomerAddress,
  ICustomerAddressCreate,
  IKycTask,
  ISegment,
  ISourceOfWealth,
  ISourceOfWealthCreate,
  ITaskDocument,
  ITaskDocumentUpload,
  IWorkflowAdvanceInput,
  IWorkflowCancelInput,
  IWorkflowDefinition,
  IWorkflowInstance,
  IWorkflowRollbackInput,
  IWorkflowStartInput,
  IWorkflowTransitionLog,
} from '~/lib/types/kyc';
import { apiBase } from './apiBase';

/**
 * KYC review workflow API.
 *
 * Wraps the CusReview `workflow` app endpoints (DRF router):
 *   - workflowdefinitions/
 *   - workflowinstances/                       (list / retrieve)
 *   - workflowinstances/start/                 (POST)
 *   - workflowinstances/{id}/advance/          (POST approve|reject)
 *   - workflowinstances/{id}/rollback/         (POST rework)
 *   - workflowinstances/{id}/cancel/           (POST)
 *   - workflowinstances/{id}/logs/             (GET audit trail)
 */
const extendedApiKyc = apiBase
  .enhanceEndpoints({
    addTagTypes: [
      'WorkflowInstance',
      'WorkflowLog',
      'WorkflowDefinition',
      'CoreProfile',
      'CusAccount',
      'SourceOfWealth',
      'TaskDocument',
      'CustomerAddress',
    ],
  })
  .injectEndpoints({
    endpoints: builder => ({
      /* ---- Workflow definitions (blueprints) ---- */
      getWorkflowDefinitions: builder.query<
        IAPIListResponse<IWorkflowDefinition>,
        { activeOnly?: boolean } | void
      >({
        query: (args) => {
          const activeOnly = args?.activeOnly ?? true;
          return `workflowdefinitions/?is_active=${activeOnly}`;
        },
        providesTags: response =>
          response
            ? response.results.map(({ id }) => ({ type: 'WorkflowDefinition' as const, id }))
            : [{ type: 'WorkflowDefinition' as const }],
      }),

      /* ---- Workflow instances ---- */
      getWorkflowInstances: builder.query<
        IAPIListResponse<IWorkflowInstance>,
        { taskId?: string, status?: string } | void
      >({
        query: (args) => {
          const params = new URLSearchParams();
          if (args?.taskId) params.set('task', args.taskId);
          if (args?.status) params.set('status', args.status);
          const qs = params.toString();
          return `workflowinstances/${qs ? `?${qs}` : ''}`;
        },
        providesTags: response =>
          response
            ? [
                ...response.results.map(({ id }) => ({ type: 'WorkflowInstance' as const, id })),
                { type: 'WorkflowInstance' as const, id: 'LIST' },
              ]
            : [{ type: 'WorkflowInstance' as const, id: 'LIST' }],
      }),

      getWorkflowInstance: builder.query<IWorkflowInstance, number | string>({
        query: id => `workflowinstances/${id}/`,
        providesTags: (_result, _error, id) => [{ type: 'WorkflowInstance', id }],
      }),

      /* ---- Start a workflow for a task ---- */
      startWorkflow: builder.mutation<IWorkflowInstance, IWorkflowStartInput>({
        query: body => ({
          url: 'workflowinstances/start/',
          method: 'POST',
          body,
        }),
        invalidatesTags: [{ type: 'WorkflowInstance', id: 'LIST' }],
      }),

      /* ---- Advance the current stage (approve / reject) ---- */
      advanceWorkflow: builder.mutation<
        IWorkflowInstance,
        { instanceId: number | string } & IWorkflowAdvanceInput
      >({
        query: ({ instanceId, decision, remarks, metadata }) => ({
          url: `workflowinstances/${instanceId}/advance/`,
          method: 'POST',
          body: {
            decision,
            remarks: remarks ?? '',
            ...(metadata ? { metadata } : {}),
          },
        }),
        invalidatesTags: (_result, _error, { instanceId }) => [
          { type: 'WorkflowInstance', id: instanceId },
          { type: 'WorkflowInstance', id: 'LIST' },
          { type: 'WorkflowLog', id: instanceId },
        ],
      }),

      /* ---- Rollback a stage (rework) ---- */
      rollbackWorkflow: builder.mutation<
        IWorkflowInstance,
        { instanceId: number | string } & IWorkflowRollbackInput
      >({
        query: ({ instanceId, stage_instance_id, remarks }) => ({
          url: `workflowinstances/${instanceId}/rollback/`,
          method: 'POST',
          body: { stage_instance_id, remarks: remarks ?? '' },
        }),
        invalidatesTags: (_result, _error, { instanceId }) => [
          { type: 'WorkflowInstance', id: instanceId },
          { type: 'WorkflowInstance', id: 'LIST' },
          { type: 'WorkflowLog', id: instanceId },
        ],
      }),

      /* ---- Cancel a workflow ---- */
      cancelWorkflow: builder.mutation<
        IWorkflowInstance,
        { instanceId: number | string } & IWorkflowCancelInput
      >({
        query: ({ instanceId, remarks }) => ({
          url: `workflowinstances/${instanceId}/cancel/`,
          method: 'POST',
          body: { remarks: remarks ?? '' },
        }),
        invalidatesTags: (_result, _error, { instanceId }) => [
          { type: 'WorkflowInstance', id: instanceId },
          { type: 'WorkflowInstance', id: 'LIST' },
          { type: 'WorkflowLog', id: instanceId },
        ],
      }),

      /* ---- Audit trail (transition logs) ---- */
      getWorkflowLogs: builder.query<IWorkflowTransitionLog[], number | string>({
        query: instanceId => `workflowinstances/${instanceId}/logs/`,
        providesTags: (_result, _error, instanceId) => [
          { type: 'WorkflowLog', id: instanceId },
        ],
      }),

      /* ================================================================ */
      /*  Reference data (conf app) – used to populate FK dropdowns       */
      /* ================================================================ */
      getTask: builder.query<IKycTask, string>({
        query: id => `tasks/${id}/`,
      }),

      getCountries: builder.query<IAPIListResponse<ICountry>, void>({
        query: () => 'countries/?page_size=100&ordering=name',
      }),

      getSegments: builder.query<IAPIListResponse<ISegment>, void>({
        query: () => 'segments/?page_size=100&ordering=name',
      }),

      /* ================================================================ */
      /*  KYC domain resources (kyc app)                                  */
      /*  NB: these viewsets define no `filterset_fields`, so server-side */
      /*  filtering by `?task=`/`?profile=` is ignored. Callers must      */
      /*  fetch the list and filter client-side.                          */
      /* ================================================================ */
      getCoreProfiles: builder.query<IAPIListResponse<ICoreProfile>, void>({
        query: () => 'coreprofiles/?page_size=100',
        providesTags: [{ type: 'CoreProfile', id: 'LIST' }],
      }),

      createCoreProfile: builder.mutation<ICoreProfile, ICoreProfileCreate>({
        query: body => ({ url: 'coreprofiles/', method: 'POST', body }),
        invalidatesTags: [{ type: 'CoreProfile', id: 'LIST' }],
      }),

      updateCoreProfile: builder.mutation<
        ICoreProfile,
        { id: number | string, body: Partial<ICoreProfileCreate> }
      >({
        query: ({ id, body }) => ({
          url: `coreprofiles/${id}/`,
          method: 'PATCH',
          body,
        }),
        invalidatesTags: [{ type: 'CoreProfile', id: 'LIST' }],
      }),

      getCusAccounts: builder.query<IAPIListResponse<ICusAccount>, void>({
        query: () => 'cusaccounts/?page_size=100',
        providesTags: [{ type: 'CusAccount', id: 'LIST' }],
      }),

      createCusAccount: builder.mutation<ICusAccount, ICusAccountCreate>({
        query: body => ({ url: 'cusaccounts/', method: 'POST', body }),
        invalidatesTags: [{ type: 'CusAccount', id: 'LIST' }],
      }),

      deleteCusAccount: builder.mutation<void, number | string>({
        query: id => ({ url: `cusaccounts/${id}/`, method: 'DELETE' }),
        invalidatesTags: [{ type: 'CusAccount', id: 'LIST' }],
      }),

      getSourcesOfWealth: builder.query<IAPIListResponse<ISourceOfWealth>, void>({
        query: () => 'sourcesofwealth/?page_size=100',
        providesTags: [{ type: 'SourceOfWealth', id: 'LIST' }],
      }),

      createSourceOfWealth: builder.mutation<ISourceOfWealth, ISourceOfWealthCreate>({
        query: body => ({ url: 'sourcesofwealth/', method: 'POST', body }),
        invalidatesTags: [{ type: 'SourceOfWealth', id: 'LIST' }],
      }),

      deleteSourceOfWealth: builder.mutation<void, number | string>({
        query: id => ({ url: `sourcesofwealth/${id}/`, method: 'DELETE' }),
        invalidatesTags: [{ type: 'SourceOfWealth', id: 'LIST' }],
      }),

      createCustomerAddress: builder.mutation<ICustomerAddress, ICustomerAddressCreate>({
        query: body => ({ url: 'customeraddresses/', method: 'POST', body }),
        invalidatesTags: [{ type: 'CustomerAddress', id: 'LIST' }],
      }),

      deleteCustomerAddress: builder.mutation<void, number | string>({
        query: id => ({ url: `customeraddresses/${id}/`, method: 'DELETE' }),
        invalidatesTags: [{ type: 'CustomerAddress', id: 'LIST' }],
      }),

      getCustomerAddresses: builder.query<IAPIListResponse<ICustomerAddress>, void>({
        query: () => 'customeraddresses/?page_size=100',
        providesTags: [{ type: 'CustomerAddress', id: 'LIST' }],
      }),

      getTaskDocuments: builder.query<IAPIListResponse<ITaskDocument>, void>({
        query: () => 'taskdocuments/?page_size=100',
        providesTags: [{ type: 'TaskDocument', id: 'LIST' }],
      }),

      /* Multipart upload – body is FormData so fetchBaseQuery leaves the
         Content-Type unset and the browser sets the multipart boundary. */
      uploadTaskDocument: builder.mutation<ITaskDocument, ITaskDocumentUpload>({
        query: ({ file, org, task, doc_type, title, remarks }) => {
          const formData = new FormData();
          formData.append('org', String(org));
          formData.append('task', task);
          formData.append('doc_type', doc_type);
          if (title) formData.append('title', title);
          if (remarks) formData.append('remarks', remarks);
          formData.append('file', file, file.name);
          return { url: 'taskdocuments/', method: 'POST', body: formData };
        },
        invalidatesTags: [{ type: 'TaskDocument', id: 'LIST' }],
      }),
    }),
    overrideExisting: false,
  });

export const {
  useGetWorkflowDefinitionsQuery,
  useGetWorkflowInstancesQuery,
  useGetWorkflowInstanceQuery,
  useStartWorkflowMutation,
  useAdvanceWorkflowMutation,
  useRollbackWorkflowMutation,
  useCancelWorkflowMutation,
  useGetWorkflowLogsQuery,
  useGetTaskQuery,
  useGetCountriesQuery,
  useGetSegmentsQuery,
  useGetCoreProfilesQuery,
  useCreateCoreProfileMutation,
  useUpdateCoreProfileMutation,
  useGetCusAccountsQuery,
  useCreateCusAccountMutation,
  useDeleteCusAccountMutation,
  useGetSourcesOfWealthQuery,
  useCreateSourceOfWealthMutation,
  useDeleteSourceOfWealthMutation,
  useCreateCustomerAddressMutation,
  useDeleteCustomerAddressMutation,
  useGetCustomerAddressesQuery,
  useGetTaskDocumentsQuery,
  useUploadTaskDocumentMutation,
} = extendedApiKyc;
