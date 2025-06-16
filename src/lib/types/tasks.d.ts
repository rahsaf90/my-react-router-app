import type { IAbstractModel, IAbstractType } from './common';

export interface ITaskType extends IAbstractType {
  code: string
}

export interface IKycTask extends IAbstractModel {
  task_type: string // Type of the KYC task
  frm_tmpl: number | null
  status: string // Status of the KYC task
  cif: string
  cust_name: string
  risk: string // Risk level associated with the KYC task

  remarks?: string // Optional remarks for the KYC task

  assigned_to?: string // User assigned to the KYC task

  task_type_name?: string // Name of the KYC task type
  status_name?: string // Name of the KYC task status
  completed_by_name?: string // Name of the user who completed the KYC task
  assigned_to_name?: string // Name of the user assigned to the KYC task
  created_by_name?: string // Name of the user who created the KYC task
  updated_by_name?: string // Name of the user who last updated the KYC task
}
