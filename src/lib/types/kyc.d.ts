import type { IAbstractModel } from './common';

/** Workflow status returned by the CusReview backend */
export type KycWorkflowStatus
  = 'draft'
    | 'pending_review'
    | 'under_review'
    | 'approved'
    | 'rejected'
    | 'returned';

/** Workflow action the user can take */
export type KycWorkflowAction
  = 'submit'
    | 'approve'
    | 'reject'
    | 'return'
    | 'save_draft';

/* ------------------------------------------------------------------ */
/*  Customer basic information (Step 1)                                */
/* ------------------------------------------------------------------ */
export interface IKycCustomerInfo {
  fullName: string
  dateOfBirth: string
  nationality: string
  nationalId: string
  gender: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  postalCode: string
  occupation: string
  employerName: string
}

/* ------------------------------------------------------------------ */
/*  Account details row (Step 2 – multi-row table)                     */
/* ------------------------------------------------------------------ */
export interface IKycAccountRow {
  accountNumber: string
  accountType: string
  currency: string
  branchName: string
  openingDate: string
  averageBalance: number
  status: string
}

/* ------------------------------------------------------------------ */
/*  Source of wealth row (Step 3 – multi-row table)                     */
/* ------------------------------------------------------------------ */
export interface IKycWealthSourceRow {
  sourceType: string
  description: string
  estimatedValue: number
  currency: string
  evidenceProvided: string
}

/* ------------------------------------------------------------------ */
/*  Document upload (Step 4)                                           */
/* ------------------------------------------------------------------ */
export type KycDocumentType
  = 'passport'
    | 'national_id'
    | 'utility_bill'
    | 'bank_statement'
    | 'salary_slip'
    | 'tax_return'
    | 'other';

export interface IKycDocument {
  documentType: KycDocumentType
  fileName: string
  file: File | null
  notes: string
}

/* ------------------------------------------------------------------ */
/*  Complete KYC form values                                           */
/* ------------------------------------------------------------------ */
export interface IKycFormValues {
  customerInfo: IKycCustomerInfo
  accounts: IKycAccountRow[]
  wealthSources: IKycWealthSourceRow[]
  documents: IKycDocument[]
}

/* ------------------------------------------------------------------ */
/*  API response models                                                */
/* ------------------------------------------------------------------ */

/** KYC review case returned by the backend */
export interface IKycReview extends IAbstractModel {
  caseNumber: string
  status: KycWorkflowStatus
  customerInfo: IKycCustomerInfo
  accounts: IKycAccountRow[]
  wealthSources: IKycWealthSourceRow[]
  documents: IKycDocumentMeta[]
  assignedTo?: string
  assignedToName?: string
  reviewerNotes?: string
}

/** Document metadata (from server, no File object) */
export interface IKycDocumentMeta extends IAbstractModel {
  documentType: KycDocumentType
  fileName: string
  fileUrl: string
  notes: string
}

/** Available transitions from the workflow engine */
export interface IKycWorkflowTransition {
  action: KycWorkflowAction
  label: string
  targetStatus: KycWorkflowStatus
}

/** Response for workflow status enquiry */
export interface IKycWorkflowState {
  currentStatus: KycWorkflowStatus
  availableTransitions: IKycWorkflowTransition[]
}
