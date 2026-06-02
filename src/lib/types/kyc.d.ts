import type { IAbstractModel } from './common';

/* ================================================================== */
/*  Workflow engine types (CusReview `workflow` app)                   */
/*                                                                     */
/*  These mirror the Django models exposed by the DRF router:          */
/*    - workflowdefinitions/                                           */
/*    - workflowinstances/  (+ start / advance / rollback / cancel /   */
/*                            logs custom actions)                     */
/*  Field names use snake_case to match the DRF serializers            */
/*  (`fields = '__all__'`).                                            */
/* ================================================================== */

/** WorkflowStageDefinition.stage_type (StageType TextChoices) */
export type WorkflowStageType
  = 'Maker'
    | 'Checker'
    | 'Approval'
    | 'Decision'
    | 'Notification'
    | 'Custom';

/** WorkflowStageDefinition.assignment_type (AssignmentType TextChoices) */
export type WorkflowAssignmentType = 'User' | 'Team' | 'Role' | 'Auto';

/** WorkflowInstance.status (WorkflowStatus TextChoices) */
export type WorkflowStatus
  = 'Initiated'
    | 'In Progress'
    | 'Completed'
    | 'Cancelled'
    | 'Failed';

/** WorkflowStageInstance.status (StageStatus TextChoices) */
export type StageStatus
  = 'Pending'
    | 'Active'
    | 'Approved'
    | 'Rejected'
    | 'Skipped'
    | 'Timed Out';

/** Decision accepted by the `advance` endpoint */
export type WorkflowDecision = 'approve' | 'reject';

/** A single on-enter / on-exit action descriptor */
export interface IWorkflowAction {
  action: string
  params?: Record<string, unknown>
}

/* ------------------------------------------------------------------ */
/*  Workflow definition (blueprint)                                    */
/* ------------------------------------------------------------------ */
export interface IWorkflowStageDefinition {
  id: number
  workflow_definition: number
  stage_order: number
  stage_type: WorkflowStageType
  name: string
  assignment_type: WorkflowAssignmentType
  assigned_user: number | null
  assigned_group: number | null
  risk_levels: number[]
  required_approvals_count: number
  is_optional: boolean
  on_enter_actions: IWorkflowAction[]
  on_exit_actions: IWorkflowAction[]
  timeout_hours: number | null
  sla_hours: number | null
}

export interface IWorkflowDefinition extends IAbstractModel {
  org?: number
  name: string
  version: number
  description: string | null
  is_active: boolean
  stages: IWorkflowStageDefinition[]
}

/* ------------------------------------------------------------------ */
/*  Workflow instance (running execution)                              */
/* ------------------------------------------------------------------ */
export interface IWorkflowStageInstance {
  id: number
  workflow_instance: number
  stage_definition: number
  /** Read-only fields surfaced by the serializer */
  stage_name: string
  stage_type: WorkflowStageType
  stage_order: number
  status: StageStatus
  assigned_to: number | null
  assigned_team: number | null
  started_at: string | null
  completed_at: string | null
  remarks: string | null
  decision: string | null
  metadata: Record<string, unknown>
}

export interface IWorkflowInstance extends IAbstractModel {
  /** Legacy FK to the kyc.Task primary key */
  task: string | null
  /** Microservice-ready generic entity reference */
  entity_id: string
  entity_type: string
  workflow_definition: number
  workflow_name: string
  current_stage: number | null
  current_stage_name: string | null
  status: WorkflowStatus
  started_at: string | null
  completed_at: string | null
  initiated_by: number | null
  stage_instances: IWorkflowStageInstance[]
}

/* ------------------------------------------------------------------ */
/*  Immutable transition audit log                                     */
/* ------------------------------------------------------------------ */
export interface IWorkflowTransitionLog {
  id: number
  workflow_instance: number
  stage_instance: number | null
  from_status: string
  to_status: string
  transitioned_by: number | null
  transitioned_by_name: string | null
  timestamp: string
  remarks: string | null
  ip_address: string | null
}

/* ------------------------------------------------------------------ */
/*  Request payloads for the custom workflow actions                   */
/* ------------------------------------------------------------------ */
export interface IWorkflowStartInput {
  task_id: string
  workflow_definition_id: number
}

export interface IWorkflowAdvanceInput {
  decision: WorkflowDecision
  remarks?: string
  /**
   * Optional structured payload persisted onto the stage instance's
   * `metadata` JSON field (e.g. the Maker's captured KYC review details).
   */
  metadata?: Record<string, unknown>
}

export interface IWorkflowRollbackInput {
  stage_instance_id: number
  remarks?: string
}

export interface IWorkflowCancelInput {
  remarks?: string
}

/* ================================================================== */
/*  KYC domain resources (CusReview `kyc` app — DRF router)            */
/*                                                                     */
/*  Endpoints (all full-CRUD ModelViewSets, serializers `__all__`):    */
/*    - coreprofiles/        CoreProfile  (one per Task)               */
/*    - customeraddresses/   CustomerAddress (multi-row)               */
/*    - cusaccounts/         CusAccount      (multi-row)               */
/*    - sourcesofwealth/     SourceOfWealth  (multi-row)               */
/*    - taskdocuments/       TaskDocument    (multipart file upload)   */
/*  Field names use snake_case to match the serializers.               */
/*  Country / Segment foreign keys are integer primary keys.           */
/* ================================================================== */

/** CoreProfile.gender (GenderChoice) */
export type KycGender = 'M' | 'F' | 'O';

/** CoreProfile.marital_status (MaritalStatusChoice) */
export type KycMaritalStatus
  = 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Other';

/** CustomerAddress.address_type (AddressTypeChoice) */
export type KycAddressType
  = 'Residence' | 'Mailing' | 'Permanent' | 'Registered' | 'Work';

/** CusAccount.acc_type (AccountTypeChoice) */
export type KycAccountType
  = 'Savings' | 'Current' | 'TermDeposit' | 'Loan'
    | 'CreditCard' | 'Investment' | 'Other';

/** CusAccount.status (AccountStatusChoice) */
export type KycAccountStatus = 'Active' | 'Dormant' | 'Closed' | 'Blocked';

/** SourceOfWealth.source_type (WealthSourceChoice) */
export type KycWealthSource
  = 'Salary' | 'Business' | 'Investment' | 'Inheritance' | 'Gift'
    | 'Savings' | 'SaleOfAsset' | 'Loan' | 'Other';

/** TaskDocument.doc_type (DocumentTypeChoice) */
export type KycDocumentType
  = 'Passport' | 'NationalID' | 'DriversLicense' | 'UtilityBill'
    | 'BankStatement' | 'Payslip' | 'TaxReturn' | 'ProofOfAddress'
    | 'ProofOfIncome' | 'Other';

/* ------------------------------------------------------------------ */
/*  Reference data (conf app)                                          */
/* ------------------------------------------------------------------ */
export interface ICountry extends IAbstractModel {
  name: string
  code: string
}

export interface ISegment extends IAbstractModel {
  country: number
  name: string
  description: string | null
}

/** Minimal slice of a kyc.Task needed to resolve the owning org. */
export interface IKycTask extends IAbstractModel {
  org: number
  task_type?: number
  cust_name?: string | null
}

/* ------------------------------------------------------------------ */
/*  Server resources                                                   */
/* ------------------------------------------------------------------ */
export interface ICoreProfile extends IAbstractModel {
  org: number
  task: string
  ref_date?: string | null
  cus_id?: string | null
  name: string
  first_name?: string | null
  middle_name?: string | null
  last_name?: string | null
  dob?: string | null
  gender?: KycGender | null
  marital_status?: KycMaritalStatus | null
  nationality?: number | null
  country_of_birth?: number | null
  occupation?: string | null
  employer_name?: string | null
  mobile?: string | null
  email?: string | null
  address?: string | null
  country?: number | null
  state?: number | null
  city?: string | null
  zipcode?: string | null
  passport_no?: string | null
  passport_country?: number | null
  passport_issue_date?: string | null
  passport_expiry_date?: string | null
}

export interface ICustomerAddress extends IAbstractModel {
  org: number
  profile: number
  address_type: KycAddressType
  line1: string
  line2?: string | null
  city: string
  state?: string | null
  zipcode?: string | null
  country: number
  is_primary: boolean
}

export interface ICusAccount extends IAbstractModel {
  org: number
  profile: number
  ref_date?: string | null
  acc_num: string
  acc_type: KycAccountType
  acc_name: string
  currency: string
  balance?: string | number | null
  branch?: string | null
  opened_date?: string | null
  status: KycAccountStatus
}

export interface ISourceOfWealth extends IAbstractModel {
  org: number
  profile: number
  ref_date?: string | null
  source_type: KycWealthSource
  description?: string | null
  amount?: string | number | null
  currency: string
  country?: number | null
  proof_ref?: string | null
}

export interface ITaskDocument extends IAbstractModel {
  org: number
  task: string
  doc_type: KycDocumentType
  title?: string | null
  file?: string | null
  file_path?: string | null
  original_name?: string | null
  mime_type?: string | null
  size_bytes?: number | null
  uploaded_time?: string | null
  remarks?: string | null
}

/* ------------------------------------------------------------------ */
/*  Mutation payloads (POST bodies — `org` injected by the caller)     */
/* ------------------------------------------------------------------ */
export type ICoreProfileCreate = Omit<ICoreProfile, keyof IAbstractModel>;
export type ICustomerAddressCreate = Omit<ICustomerAddress, keyof IAbstractModel>;
export type ICusAccountCreate = Omit<ICusAccount, keyof IAbstractModel>;
export type ISourceOfWealthCreate = Omit<ISourceOfWealth, keyof IAbstractModel>;

/** Multipart document upload (the `file` blob is sent as FormData). */
export interface ITaskDocumentUpload {
  org: number
  task: string
  doc_type: KycDocumentType
  title?: string
  remarks?: string
  file: File
}

/* ================================================================== */
/*  KYC data-entry form values (used by the Maker step forms)          */
/*                                                                     */
/*  Mirror the backend resources 1:1 so submission requires no field   */
/*  renaming. Foreign keys hold the integer pk (or '' when unset).     */
/* ================================================================== */

export interface IKycProfileForm {
  name: string
  cus_id: string
  first_name: string
  middle_name: string
  last_name: string
  dob: string
  gender: KycGender | ''
  marital_status: KycMaritalStatus | ''
  nationality: number | ''
  country_of_birth: number | ''
  occupation: string
  employer_name: string
  mobile: string
  email: string
  address: string
  country: number | ''
  state: number | ''
  city: string
  zipcode: string
  passport_no: string
  passport_country: number | ''
  passport_issue_date: string
  passport_expiry_date: string
}

export interface IKycAddressForm {
  address_type: KycAddressType
  line1: string
  line2: string
  city: string
  state: string
  zipcode: string
  country: number | ''
  is_primary: boolean
}

export interface IKycAccountForm {
  acc_num: string
  acc_type: KycAccountType
  acc_name: string
  currency: string
  balance: number | ''
  branch: string
  opened_date: string
  status: KycAccountStatus
}

export interface IKycWealthSourceForm {
  source_type: KycWealthSource
  description: string
  amount: number | ''
  currency: string
  country: number | ''
  proof_ref: string
}

export interface IKycDocumentForm {
  doc_type: KycDocumentType
  title: string
  file: File | null
  fileName: string
  remarks: string
}

/* ------------------------------------------------------------------ */
/*  Complete KYC form values                                           */
/* ------------------------------------------------------------------ */
export interface IKycFormValues {
  profile: IKycProfileForm
  addresses: IKycAddressForm[]
  accounts: IKycAccountForm[]
  wealthSources: IKycWealthSourceForm[]
  documents: IKycDocumentForm[]
}
