import * as yup from 'yup';
import type { IFrmField, IFrmSubSect, IFrmTmplSerialized } from '~/lib/types/conf';
import type {
    IKycAccountForm,
    IKycAddressForm,
    IKycDocumentForm,
    IKycFormValues,
    IKycProfileForm,
    IKycWealthSourceForm,
} from '~/lib/types/kyc';
import {
    bucketForSubSect,
    isArrayBucket,
    visibleFields,
    visibleSections,
    visibleSubSects,
    type KycArrayBucket,
} from './dynamicForm';

/* ------------------------------------------------------------------ */
/*  Backend choice values (mirror kyc.models.core TextChoices)         */
/* ------------------------------------------------------------------ */
export const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'O', label: 'Other' },
] as const;

export const MARITAL_STATUS_OPTIONS = [
  { value: 'Single', label: 'Single' },
  { value: 'Married', label: 'Married' },
  { value: 'Divorced', label: 'Divorced' },
  { value: 'Widowed', label: 'Widowed' },
  { value: 'Other', label: 'Other' },
] as const;

export const ADDRESS_TYPE_OPTIONS = [
  { value: 'Residence', label: 'Residence' },
  { value: 'Mailing', label: 'Mailing' },
  { value: 'Permanent', label: 'Permanent' },
  { value: 'Registered', label: 'Registered' },
  { value: 'Work', label: 'Work' },
] as const;

export const ACCOUNT_TYPE_OPTIONS = [
  { value: 'Savings', label: 'Savings' },
  { value: 'Current', label: 'Current' },
  { value: 'TermDeposit', label: 'Term Deposit' },
  { value: 'Loan', label: 'Loan' },
  { value: 'CreditCard', label: 'Credit Card' },
  { value: 'Investment', label: 'Investment' },
  { value: 'Other', label: 'Other' },
] as const;

export const ACCOUNT_STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Dormant', label: 'Dormant' },
  { value: 'Closed', label: 'Closed' },
  { value: 'Blocked', label: 'Blocked' },
] as const;

export const WEALTH_SOURCE_OPTIONS = [
  { value: 'Salary', label: 'Salary / Employment Income' },
  { value: 'Business', label: 'Business Income' },
  { value: 'Investment', label: 'Investment Returns' },
  { value: 'Inheritance', label: 'Inheritance' },
  { value: 'Gift', label: 'Gift' },
  { value: 'Savings', label: 'Personal Savings' },
  { value: 'SaleOfAsset', label: 'Sale of Asset' },
  { value: 'Loan', label: 'Loan / Borrowing' },
  { value: 'Other', label: 'Other' },
] as const;

export const DOCUMENT_TYPE_OPTIONS = [
  { value: 'Passport', label: 'Passport' },
  { value: 'NationalID', label: 'National ID' },
  { value: 'DriversLicense', label: 'Driver\'s License' },
  { value: 'UtilityBill', label: 'Utility Bill' },
  { value: 'BankStatement', label: 'Bank Statement' },
  { value: 'Payslip', label: 'Payslip' },
  { value: 'TaxReturn', label: 'Tax Return' },
  { value: 'ProofOfAddress', label: 'Proof of Address' },
  { value: 'ProofOfIncome', label: 'Proof of Income' },
  { value: 'Other', label: 'Other' },
] as const;

/* An optional foreign-key / numeric select: holds an integer pk or ''. */
const optionalNumeric = yup
  .mixed<number | ''>()
  .transform(value => (value === '' || value == null ? '' : value))
  .default('');

/* ------------------------------------------------------------------ */
/*  Step 1 – Core profile (demographics, contact, passport)            */
/* ------------------------------------------------------------------ */
export const profileSchema = yup.object({
  name: yup.string().trim().required('Full name is required'),
  cus_id: yup.string().trim().default(''),
  first_name: yup.string().trim().default(''),
  middle_name: yup.string().trim().default(''),
  last_name: yup.string().trim().default(''),
  dob: yup.string().trim().default(''),
  gender: yup.string().oneOf(['', 'M', 'F', 'O']).default(''),
  marital_status: yup
    .string()
    .oneOf(['', 'Single', 'Married', 'Divorced', 'Widowed', 'Other'])
    .default(''),
  nationality: optionalNumeric,
  country_of_birth: optionalNumeric,
  occupation: yup.string().trim().default(''),
  employer_name: yup.string().trim().default(''),
  mobile: yup.string().trim().default(''),
  email: yup.string().trim().email('Enter a valid email').default(''),
  address: yup.string().trim().default(''),
  country: optionalNumeric,
  state: optionalNumeric,
  city: yup.string().trim().default(''),
  zipcode: yup.string().trim().default(''),
  passport_no: yup.string().trim().default(''),
  passport_country: optionalNumeric,
  passport_issue_date: yup.string().trim().default(''),
  passport_expiry_date: yup.string().trim().default(''),
});

/* ------------------------------------------------------------------ */
/*  Step 2 – Addresses (kyc.CustomerAddress, multi-row)                */
/*  `country` is required by the backend for every address row.        */
/* ------------------------------------------------------------------ */
export const addressRowSchema = yup.object({
  address_type: yup
    .string()
    .oneOf(['Residence', 'Mailing', 'Permanent', 'Registered', 'Work'])
    .required('Select an address type'),
  line1: yup.string().trim().required('Address line 1 is required'),
  line2: yup.string().trim().default(''),
  city: yup.string().trim().required('City is required'),
  state: yup.string().trim().default(''),
  zipcode: yup.string().trim().default(''),
  country: yup
    .number()
    .typeError('Country is required')
    .required('Country is required'),
  is_primary: yup.boolean().default(false),
});

/* ------------------------------------------------------------------ */
/*  Step 3 – Accounts (kyc.CusAccount, multi-row)                      */
/* ------------------------------------------------------------------ */
export const accountRowSchema = yup.object({
  acc_num: yup.string().trim().required('Account number is required'),
  acc_type: yup
    .string()
    .oneOf([
      'Savings', 'Current', 'TermDeposit', 'Loan',
      'CreditCard', 'Investment', 'Other',
    ])
    .required('Account type is required'),
  acc_name: yup.string().trim().required('Account name is required'),
  currency: yup.string().trim().required('Currency is required'),
  balance: optionalNumeric,
  branch: yup.string().trim().default(''),
  opened_date: yup.string().trim().default(''),
  status: yup
    .string()
    .oneOf(['Active', 'Dormant', 'Closed', 'Blocked'])
    .required('Status is required'),
});

/* ------------------------------------------------------------------ */
/*  Step 4 – Sources of wealth (kyc.SourceOfWealth, multi-row)         */
/* ------------------------------------------------------------------ */
export const wealthSourceRowSchema = yup.object({
  source_type: yup
    .string()
    .oneOf([
      'Salary', 'Business', 'Investment', 'Inheritance', 'Gift',
      'Savings', 'SaleOfAsset', 'Loan', 'Other',
    ])
    .required('Source type is required'),
  description: yup.string().trim().default(''),
  amount: optionalNumeric,
  currency: yup.string().trim().required('Currency is required'),
  country: optionalNumeric,
  proof_ref: yup.string().trim().default(''),
});

/* ------------------------------------------------------------------ */
/*  Step 5 – Documents (kyc.TaskDocument, multi-row file uploads)      */
/* ------------------------------------------------------------------ */
export const documentSchema = yup.object({
  doc_type: yup
    .string()
    .oneOf([
      'Passport', 'NationalID', 'DriversLicense', 'UtilityBill',
      'BankStatement', 'Payslip', 'TaxReturn', 'ProofOfAddress',
      'ProofOfIncome', 'Other',
    ])
    .required('Document type is required'),
  title: yup.string().trim().default(''),
  file: yup.mixed<File>().nullable().required('A file is required'),
  fileName: yup.string().trim().required('A file is required'),
  remarks: yup.string().trim().default(''),
});

/* ------------------------------------------------------------------ */
/*  Full form schema                                                   */
/* ------------------------------------------------------------------ */
export const kycFormSchema = yup.object({
  profile: profileSchema,
  addresses: yup.array().of(addressRowSchema).default([]),
  accounts: yup
    .array()
    .of(accountRowSchema)
    .min(1, 'Add at least one account')
    .required(),
  wealthSources: yup
    .array()
    .of(wealthSourceRowSchema)
    .min(1, 'Add at least one source of wealth')
    .required(),
  documents: yup.array().of(documentSchema).default([]),
});

/* ------------------------------------------------------------------ */
/*  Default values                                                     */
/* ------------------------------------------------------------------ */
export const defaultProfile: IKycProfileForm = {
  name: '',
  cus_id: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  dob: '',
  gender: '',
  marital_status: '',
  nationality: '',
  country_of_birth: '',
  occupation: '',
  employer_name: '',
  mobile: '',
  email: '',
  address: '',
  country: '',
  state: '',
  city: '',
  zipcode: '',
  passport_no: '',
  passport_country: '',
  passport_issue_date: '',
  passport_expiry_date: '',
};

export const defaultAddressRow: IKycAddressForm = {
  address_type: 'Residence',
  line1: '',
  line2: '',
  city: '',
  state: '',
  zipcode: '',
  country: '',
  is_primary: true,
};

export const defaultAccountRow: IKycAccountForm = {
  acc_num: '',
  acc_type: 'Savings',
  acc_name: '',
  currency: 'USD',
  balance: '',
  branch: '',
  opened_date: '',
  status: 'Active',
};

export const defaultWealthSourceRow: IKycWealthSourceForm = {
  source_type: 'Salary',
  description: '',
  amount: '',
  currency: 'USD',
  country: '',
  proof_ref: '',
};

export const defaultDocument: IKycDocumentForm = {
  doc_type: 'Passport',
  title: '',
  file: null,
  fileName: '',
  remarks: '',
};

export const kycFormDefaults: IKycFormValues = {
  profile: defaultProfile,
  addresses: [],
  accounts: [defaultAccountRow],
  wealthSources: [defaultWealthSourceRow],
  documents: [],
};

/* ------------------------------------------------------------------ */
/*  Dynamic, rules-driven schema                                       */
/*                                                                     */
/*  Builds a yup schema straight from the template's field `rules`     */
/*  (required / maxlength / options / fk_model) and `field_type`, so   */
/*  validation tracks the backend form-config instead of the static   */
/*  schemas above. The static schemas remain as fallbacks for buckets  */
/*  the template does not describe.                                    */
/* ------------------------------------------------------------------ */

// eslint-disable-next-line ts/no-explicit-any
type AnyFieldSchema = yup.Schema<any, any, any, any>;

/** Build a single field validator from its `field_type` + `rules`. */
function fieldSchema(field: IFrmField): AnyFieldSchema {
  const required = !!field.rules?.required;
  const max = field.rules?.maxlength;
  const label = field.name || field.attr_name;

  if (field.field_type === 'checkbox') {
    return yup.boolean().default(false);
  }

  // Foreign-key selects and numeric inputs hold an integer pk or ''.
  if (field.rules?.fk_model || field.field_type === 'number') {
    return required
      ? yup
          .number()
          .typeError(`${label} is required`)
          .required(`${label} is required`)
      : yup
          .mixed<number | ''>()
          .transform(v => (v === '' || v == null ? '' : v))
          .default('');
  }

  if (field.field_type === 'multiselect') {
    const arr = yup.array().of(yup.string().defined()).default([]);
    return required ? arr.min(1, `${label} is required`) : arr;
  }

  if (field.field_type === 'select') {
    const opts = (field.rules?.options ?? []).map(o => String(o.value));
    let s = yup.string().trim();
    if (opts.length) {
      s = s.oneOf(required ? opts : ['', ...opts], `Select a valid ${label}`);
    }
    return required ? s.required(`${label} is required`) : s.default('');
  }

  // text / date / textarea (and anything else) → string
  let s = yup.string().trim();
  if (field.attr_name.includes('email')) {
    s = s.email('Enter a valid email');
  }
  if (max) {
    s = s.max(max, `${label} must be at most ${max} characters`);
  }
  return required ? s.required(`${label} is required`) : s.default('');
}

/** Assemble an object schema from the fields of one or more sub-sections. */
function objectSchemaFromSubSects(subs: IFrmSubSect[]): AnyFieldSchema {
  const shape: Record<string, AnyFieldSchema> = {};
  for (const sub of subs) {
    for (const field of visibleFields(sub)) {
      // Upload fields contribute the binary (`file`) plus its mirror name.
      if (field.rules?.upload) {
        const required = !!field.rules?.required;
        shape[field.attr_name] = required
          ? yup.mixed<File>().nullable().required('A file is required')
          : yup.mixed<File>().nullable().default(null);
        shape.fileName = required
          ? yup.string().required('A file is required')
          : yup.string().default('');
        continue;
      }
      shape[field.attr_name] = fieldSchema(field);
    }
  }
  return yup.object(shape);
}

/**
 * Build the full KYC form schema from a serialized template.
 *
 * Sub-sections are grouped by bucket (via `model_name`): single buckets feed
 * the `profile` object, array buckets feed their repeatable row schema. Buckets
 * the template omits fall back to the static schemas. Note: collection minimums
 * (e.g. "at least one account") are NOT inferred — they are driven purely by
 * the template's field rules.
 */
export function buildKycSchema(
  template: IFrmTmplSerialized,
): yup.ObjectSchema<IKycFormValues> {
  const sections = visibleSections(template.form_sections ?? []);

  const profileSubs: IFrmSubSect[] = [];
  const arraySubs: Partial<Record<KycArrayBucket, IFrmSubSect[]>> = {};

  for (const section of sections) {
    for (const sub of visibleSubSects(section)) {
      const bucket = bucketForSubSect(sub);
      if (bucket === 'remarks') continue;
      if (isArrayBucket(bucket)) {
        (arraySubs[bucket] ??= []).push(sub);
      }
      else {
        profileSubs.push(sub);
      }
    }
  }

  const arrayOf = (bucket: KycArrayBucket, fallback: AnyFieldSchema) => {
    const subs = arraySubs[bucket];
    return subs?.length
      ? yup.array().of(objectSchemaFromSubSects(subs)).default([])
      : yup.array().of(fallback).default([]);
  };

  return yup.object({
    profile: profileSubs.length
      ? objectSchemaFromSubSects(profileSubs)
      : profileSchema,
    addresses: arrayOf('addresses', addressRowSchema),
    accounts: arrayOf('accounts', accountRowSchema),
    wealthSources: arrayOf('wealthSources', wealthSourceRowSchema),
    documents: arrayOf('documents', documentSchema),
  }) as unknown as yup.ObjectSchema<IKycFormValues>;
}
