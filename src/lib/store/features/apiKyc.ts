import type { IAPIListResponse } from '~/lib/types/common';
import type {
  IKycFormValues,
  IKycReview,
  KycWorkflowAction,
  IKycWorkflowState,
} from '~/lib/types/kyc';
import { apiBase } from './apiBase';

const extendedApiKyc = apiBase
  .enhanceEndpoints({ addTagTypes: ['KycReview', 'KycWorkflow'] })
  .injectEndpoints({
    endpoints: builder => ({

      /* ---- List / Read ---- */
      getKycReviews: builder.query<
        IAPIListResponse<IKycReview>,
        { page?: number, limit?: number }
      >({
        query: ({ page = 1, limit = 20 }) =>
          `kyc/reviews/?offset=${(page - 1) * limit}&limit=${limit}`,
        providesTags: response =>
          response
            ? response.results.map(({ id }) => ({ type: 'KycReview', id }))
            : [{ type: 'KycReview' }],
      }),

      getKycReview: builder.query<IKycReview, string>({
        query: id => `kyc/reviews/${id}/`,
        providesTags: (_result, _error, id) => [{ type: 'KycReview', id }],
      }),

      /* ---- Create ---- */
      createKycReview: builder.mutation<IKycReview, IKycFormValues>({
        query: body => ({
          url: 'kyc/reviews/',
          method: 'POST',
          body,
        }),
        invalidatesTags: [{ type: 'KycReview' }],
      }),

      /* ---- Update (save draft) ---- */
      updateKycReview: builder.mutation<
        IKycReview,
        { id: string, data: Partial<IKycFormValues> }
      >({
        query: ({ id, data }) => ({
          url: `kyc/reviews/${id}/`,
          method: 'PATCH',
          body: data,
        }),
        invalidatesTags: (_result, _error, { id }) => [
          { type: 'KycReview', id },
        ],
      }),

      /* ---- Document upload ---- */
      uploadKycDocument: builder.mutation<
        { id: number, fileUrl: string, fileName: string },
        { reviewId: string, file: File, documentType: string, notes: string }
      >({
        query: ({ reviewId, file, documentType, notes }) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('document_type', documentType);
          formData.append('notes', notes);
          return {
            url: `kyc/reviews/${reviewId}/documents/`,
            method: 'POST',
            body: formData,
          };
        },
        invalidatesTags: (_result, _error, { reviewId }) => [
          { type: 'KycReview', id: reviewId },
        ],
      }),

      /* ---- Workflow endpoints (from CusReview backend) ---- */
      getKycWorkflowState: builder.query<IKycWorkflowState, string>({
        query: reviewId => `kyc/reviews/${reviewId}/workflow/`,
        providesTags: (_result, _error, id) => [{ type: 'KycWorkflow', id }],
      }),

      performKycWorkflowAction: builder.mutation<
        IKycReview,
        { reviewId: string, action: KycWorkflowAction, notes?: string }
      >({
        query: ({ reviewId, action, notes }) => ({
          url: `kyc/reviews/${reviewId}/workflow/`,
          method: 'POST',
          body: { action, notes },
        }),
        invalidatesTags: (_result, _error, { reviewId }) => [
          { type: 'KycReview', id: reviewId },
          { type: 'KycWorkflow', id: reviewId },
        ],
      }),
    }),
    overrideExisting: false,
  });

export const {
  useGetKycReviewsQuery,
  useGetKycReviewQuery,
  useCreateKycReviewMutation,
  useUpdateKycReviewMutation,
  useUploadKycDocumentMutation,
  useGetKycWorkflowStateQuery,
  usePerformKycWorkflowActionMutation,
} = extendedApiKyc;
