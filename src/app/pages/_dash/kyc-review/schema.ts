import * as yup from 'yup';
import type { IKycFormValues } from '~/lib/types/kyc';

/* ------------------------------------------------------------------ */
/*  Step 1 – Customer basic information                                */
/* ------------------------------------------------------------------ */
export const customerInfoSchema = yup.object({
  fullName: yup.string().trim().required('Full name is required'),
  dateOfBirth: yup.string().trim().required('Date of birth is required'),
  nationality: yup.string().trim().required('Nationality is required'),
  nationalId: yup.string().trim().required('National / passport ID is required'),
  gender: yup
    .string()
    .oneOf(['male', 'female', 'other'], 'Select a valid gender')
    .required('Gender is required'),
  email: yup.string().trim().email('Enter a valid email').required('Email is required'),
  phone: yup.string().trim().required('Phone number is required'),
  address: yup.string().trim().required('Address is required'),
  city: yup.string().trim().required('City is required'),
  country: yup.string().trim().required('Country is required'),
  postalCode: yup.string().trim().required('Postal code is required'),
  occupation: yup.string().trim().required('Occupation is required'),
  employerName: yup.string().trim().default(''),
});

/* ------------------------------------------------------------------ */
/*  Step 2 – Account details (multi-row)                               */
/* ------------------------------------------------------------------ */
export const accountRowSchema = yup.object({
  accountNumber: yup.string().trim().required('Account number is required'),
  accountType: yup
    .string()
    .oneOf(['savings', 'current', 'fixed_deposit', 'loan', 'credit_card'], 'Select account type')
    .required('Account type is required'),
  currency: yup.string().trim().required('Currency is required'),
  branchName: yup.string().trim().required('Branch name is required'),
  openingDate: yup.string().trim().required('Opening date is required'),
  averageBalance: yup
    .number()
    .typeError('Must be a number')
    .min(0, 'Cannot be negative')
    .required('Average balance is required'),
  status: yup
    .string()
    .oneOf(['active', 'dormant', 'closed'], 'Select account status')
    .required('Status is required'),
});

/* ------------------------------------------------------------------ */
/*  Step 3 – Sources of wealth (multi-row)                             */
/* ------------------------------------------------------------------ */
export const wealthSourceRowSchema = yup.object({
  sourceType: yup
    .string()
    .oneOf(
      ['employment', 'business', 'inheritance', 'investment', 'property', 'gift', 'other'],
      'Select source type',
    )
    .required('Source type is required'),
  description: yup.string().trim().required('Description is required'),
  estimatedValue: yup
    .number()
    .typeError('Must be a number')
    .min(0, 'Cannot be negative')
    .required('Estimated value is required'),
  currency: yup.string().trim().required('Currency is required'),
  evidenceProvided: yup.string().trim().default(''),
});

/* ------------------------------------------------------------------ */
/*  Step 4 – Documents                                                 */
/* ------------------------------------------------------------------ */
export const documentSchema = yup.object({
  documentType: yup
    .string()
    .oneOf(
      [
        'passport', 'national_id', 'utility_bill',
        'bank_statement', 'salary_slip', 'tax_return', 'other',
      ],
      'Select document type',
    )
    .required('Document type is required'),
  fileName: yup.string().trim().required('File is required'),
  file: yup.mixed<File>().nullable().required('File is required'),
  notes: yup.string().trim().default(''),
});

/* ------------------------------------------------------------------ */
/*  Full form schema                                                   */
/* ------------------------------------------------------------------ */
export const kycFormSchema = yup.object({
  customerInfo: customerInfoSchema,
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
  documents: yup
    .array()
    .of(documentSchema)
    .min(1, 'Upload at least one document')
    .required(),
});

/* ------------------------------------------------------------------ */
/*  Default values                                                     */
/* ------------------------------------------------------------------ */
export const defaultCustomerInfo: IKycFormValues['customerInfo'] = {
  fullName: '',
  dateOfBirth: '',
  nationality: '',
  nationalId: '',
  gender: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: '',
  postalCode: '',
  occupation: '',
  employerName: '',
};

export const defaultAccountRow: IKycFormValues['accounts'][number] = {
  accountNumber: '',
  accountType: '',
  currency: 'USD',
  branchName: '',
  openingDate: '',
  averageBalance: 0,
  status: 'active',
};

export const defaultWealthSourceRow: IKycFormValues['wealthSources'][number] = {
  sourceType: '',
  description: '',
  estimatedValue: 0,
  currency: 'USD',
  evidenceProvided: '',
};

export const defaultDocument: IKycFormValues['documents'][number] = {
  documentType: 'passport',
  fileName: '',
  file: null,
  notes: '',
};

export const kycFormDefaults: IKycFormValues = {
  customerInfo: defaultCustomerInfo,
  accounts: [defaultAccountRow],
  wealthSources: [defaultWealthSourceRow],
  documents: [],
};
