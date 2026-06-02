import type {
    ICoreProfile,
    ICoreProfileCreate,
    ICusAccount,
    ICusAccountCreate,
    ICustomerAddress,
    ICustomerAddressCreate,
    IKycAccountForm,
    IKycAddressForm,
    IKycFormValues,
    IKycProfileForm,
    IKycWealthSourceForm,
    ISourceOfWealth,
    ISourceOfWealthCreate,
    ITaskDocument,
} from '~/lib/types/kyc';
import { kycFormDefaults } from './schema';

/* ------------------------------------------------------------------ */
/*  Form → POST payloads                                               */
/* ------------------------------------------------------------------ */

/** Empty string → null (Django rejects '' for nullable FK / date fields). */
function nz<T>(v: T | '' | null | undefined): T | null {
  return v === '' || v == null ? null : v;
}

export function toCoreProfileCreate(
  form: IKycProfileForm,
  org: number,
  task: string,
): ICoreProfileCreate {
  return {
    org,
    task,
    name: form.name.trim(),
    cus_id: nz(form.cus_id),
    first_name: nz(form.first_name),
    middle_name: nz(form.middle_name),
    last_name: nz(form.last_name),
    dob: nz(form.dob),
    gender: nz(form.gender),
    marital_status: nz(form.marital_status),
    nationality: nz(form.nationality),
    country_of_birth: nz(form.country_of_birth),
    occupation: nz(form.occupation),
    employer_name: nz(form.employer_name),
    mobile: nz(form.mobile),
    email: nz(form.email),
    address: nz(form.address),
    country: nz(form.country),
    state: nz(form.state),
    city: nz(form.city),
    zipcode: nz(form.zipcode),
    passport_no: nz(form.passport_no),
    passport_country: nz(form.passport_country),
    passport_issue_date: nz(form.passport_issue_date),
    passport_expiry_date: nz(form.passport_expiry_date),
  };
}

export function toCustomerAddressCreate(
  form: IKycAddressForm,
  org: number,
  profile: number,
): ICustomerAddressCreate {
  return {
    org,
    profile,
    address_type: form.address_type,
    line1: form.line1.trim(),
    line2: nz(form.line2),
    city: form.city.trim(),
    state: nz(form.state),
    zipcode: nz(form.zipcode),
    country: form.country as number,
    is_primary: form.is_primary,
  };
}

export function toCusAccountCreate(
  form: IKycAccountForm,
  org: number,
  profile: number,
): ICusAccountCreate {
  return {
    org,
    profile,
    acc_num: form.acc_num.trim(),
    acc_type: form.acc_type,
    acc_name: form.acc_name.trim(),
    currency: form.currency.trim() || 'USD',
    balance: nz(form.balance),
    branch: nz(form.branch),
    opened_date: nz(form.opened_date),
    status: form.status,
  };
}

export function toSourceOfWealthCreate(
  form: IKycWealthSourceForm,
  org: number,
  profile: number,
): ISourceOfWealthCreate {
  return {
    org,
    profile,
    source_type: form.source_type,
    description: nz(form.description),
    amount: nz(form.amount),
    currency: form.currency.trim() || 'USD',
    country: nz(form.country),
    proof_ref: nz(form.proof_ref),
  };
}

/* ------------------------------------------------------------------ */
/*  Domain resources → form values (read-only Checker review)          */
/* ------------------------------------------------------------------ */
export function domainToFormValues(args: {
  profile?: ICoreProfile
  addresses: ICustomerAddress[]
  accounts: ICusAccount[]
  wealthSources: ISourceOfWealth[]
  documents: ITaskDocument[]
}): IKycFormValues {
  const { profile, addresses, accounts, wealthSources, documents } = args;

  const profileForm: IKycFormValues['profile'] = profile
    ? {
        name: profile.name ?? '',
        cus_id: profile.cus_id ?? '',
        first_name: profile.first_name ?? '',
        middle_name: profile.middle_name ?? '',
        last_name: profile.last_name ?? '',
        dob: profile.dob ?? '',
        gender: profile.gender ?? '',
        marital_status: profile.marital_status ?? '',
        nationality: profile.nationality ?? '',
        country_of_birth: profile.country_of_birth ?? '',
        occupation: profile.occupation ?? '',
        employer_name: profile.employer_name ?? '',
        mobile: profile.mobile ?? '',
        email: profile.email ?? '',
        address: profile.address ?? '',
        country: profile.country ?? '',
        state: profile.state ?? '',
        city: profile.city ?? '',
        zipcode: profile.zipcode ?? '',
        passport_no: profile.passport_no ?? '',
        passport_country: profile.passport_country ?? '',
        passport_issue_date: profile.passport_issue_date ?? '',
        passport_expiry_date: profile.passport_expiry_date ?? '',
      }
    : kycFormDefaults.profile;

  return {
    profile: profileForm,
    addresses: addresses.map(a => ({
      address_type: a.address_type,
      line1: a.line1 ?? '',
      line2: a.line2 ?? '',
      city: a.city ?? '',
      state: a.state ?? '',
      zipcode: a.zipcode ?? '',
      country: a.country ?? '',
      is_primary: a.is_primary,
    })),
    accounts: accounts.map(a => ({
      acc_num: a.acc_num ?? '',
      acc_type: a.acc_type,
      acc_name: a.acc_name ?? '',
      currency: a.currency ?? '',
      balance: a.balance == null ? '' : Number(a.balance),
      branch: a.branch ?? '',
      opened_date: a.opened_date ?? '',
      status: a.status,
    })),
    wealthSources: wealthSources.map(w => ({
      source_type: w.source_type,
      description: w.description ?? '',
      amount: w.amount == null ? '' : Number(w.amount),
      currency: w.currency ?? '',
      country: w.country ?? '',
      proof_ref: w.proof_ref ?? '',
    })),
    documents: documents.map(d => ({
      doc_type: d.doc_type,
      title: d.title ?? '',
      file: null,
      fileName: d.original_name ?? d.title ?? '',
      remarks: d.remarks ?? '',
    })),
  };
}
