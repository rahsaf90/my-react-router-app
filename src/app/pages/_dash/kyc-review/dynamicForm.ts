import type { IFrmField, IFrmSect, IFrmSubSect } from '~/lib/types/conf';
import type { ICountry, IKycFormValues, ISegment } from '~/lib/types/kyc';
import {
  defaultAccountRow,
  defaultAddressRow,
  defaultDocument,
  defaultWealthSourceRow,
} from './schema';

/* ------------------------------------------------------------------ */
/*  Bucket mapping                                                     */
/*                                                                     */
/*  The form value shape (IKycFormValues) is fixed so that the         */
/*  existing yup schema, mappers and domain-persistence keep working.  */
/*  The template's `model_name` decides which bucket a sub-section's   */
/*  fields belong to; the field `attr_name` matches the bucket keys.   */
/* ------------------------------------------------------------------ */
export type KycBucket
  = 'profile'
    | 'addresses'
    | 'accounts'
    | 'wealthSources'
    | 'documents'
    | 'remarks';

/** Buckets backed by a repeatable array of rows in IKycFormValues. */
export type KycArrayBucket = 'addresses' | 'accounts' | 'wealthSources' | 'documents';

const MODEL_TO_BUCKET: Record<string, KycBucket> = {
  'kyc.CoreProfile': 'profile',
  'kyc.CustomerAddress': 'addresses',
  'kyc.CusAccount': 'accounts',
  'kyc.SourceOfWealth': 'wealthSources',
  'kyc.TaskDocument': 'documents',
  'workflow.WorkflowStageInstance': 'remarks',
};

const ARRAY_BUCKETS: KycArrayBucket[] = [
  'addresses',
  'accounts',
  'wealthSources',
  'documents',
];

/** Default row factory for each repeatable bucket. */
export const ROW_DEFAULTS: Record<KycArrayBucket, () => IKycFormValues[KycArrayBucket][number]> = {
  addresses: () => ({ ...defaultAddressRow }),
  accounts: () => ({ ...defaultAccountRow }),
  wealthSources: () => ({ ...defaultWealthSourceRow }),
  documents: () => ({ ...defaultDocument }),
};

/** Resolve the bucket for a sub-section from its fields' `model_name`. */
export function bucketForSubSect(sub: IFrmSubSect): KycBucket {
  const model = sub.fields.find(f => f.model_name)?.model_name ?? '';
  return MODEL_TO_BUCKET[model] ?? 'profile';
}

export function isArrayBucket(bucket: KycBucket): bucket is KycArrayBucket {
  return (ARRAY_BUCKETS as string[]).includes(bucket);
}

/** A sub-section is a repeatable table when any field carries `multi_row`. */
export function isMultiRow(sub: IFrmSubSect): boolean {
  return sub.fields.some(f => f.rules?.multi_row);
}

/** The repeatable bucket a multi-row sub-section drives (if any). */
export function arrayBucketForSubSect(sub: IFrmSubSect): KycArrayBucket | null {
  const bucket = bucketForSubSect(sub);
  return isArrayBucket(bucket) ? bucket : null;
}

/** RHF field path for a field within the profile (single) bucket. */
export function profileFieldPath(field: IFrmField): string {
  return `profile.${field.attr_name}`;
}

/** RHF field path for a field within a repeatable row. */
export function rowFieldPath(
  bucket: KycArrayBucket,
  index: number,
  field: IFrmField,
): string {
  return `${bucket}.${index}.${field.attr_name}`;
}

export interface FieldOption {
  value: string | number
  label: string
}

export interface ReferenceOptionCache {
  countryOptions: FieldOption[]
  segmentOptions: FieldOption[]
}

/**
 * Resolve the option list for a select/multiselect field.
 *  - `rules.fk_model === 'conf.Country'` → country reference data
 *  - `rules.fk_model === 'conf.Segment'` → segment reference data
 *  - otherwise the static `rules.options`
 */
export function fieldOptions(
  field: IFrmField,
  countries: ICountry[],
  segments: ISegment[],
  optionCache?: ReferenceOptionCache,
): FieldOption[] {
  const fk = field.rules?.fk_model;
  if (fk === 'conf.Country') {
    return optionCache?.countryOptions
      ?? countries.map(c => ({ value: c.id!, label: c.name }));
  }
  if (fk === 'conf.Segment') {
    return optionCache?.segmentOptions
      ?? segments.map(s => ({ value: s.id!, label: s.name }));
  }
  return field.rules?.options ?? [];
}

export function isFieldRequired(field: IFrmField): boolean {
  return !!field.rules?.required;
}

export function isUploadField(field: IFrmField): boolean {
  return !!field.rules?.upload;
}

/** Visible, active fields of a sub-section in display order. */
export function visibleFields(sub: IFrmSubSect): IFrmField[] {
  return [...(sub.fields ?? [])]
    .filter(f => f.is_active !== false)
    .sort((a, b) => (a.disp_order ?? 0) - (b.disp_order ?? 0));
}

/** Visible, active sub-sections of a section in display order. */
export function visibleSubSects(section: IFrmSect): IFrmSubSect[] {
  return [...(section.sub_sections ?? [])]
    .filter(s => s.is_active !== false)
    .sort((a, b) => (a.disp_order ?? 0) - (b.disp_order ?? 0));
}

/** Visible, active sections of a template in display order. */
export function visibleSections(sections: IFrmSect[]): IFrmSect[] {
  return [...(sections ?? [])]
    .filter(s => s.is_active !== false)
    .sort((a, b) => (a.disp_order ?? 0) - (b.disp_order ?? 0));
}

/**
 * RHF field paths that should be validated before leaving a section step.
 * Array buckets are validated as a whole so newly-added rows are covered.
 */
export function sectionValidationPaths(section: IFrmSect): string[] {
  const paths = new Set<string>();
  for (const sub of visibleSubSects(section)) {
    const bucket = bucketForSubSect(sub);
    if (bucket === 'remarks') continue;
    if (isArrayBucket(bucket)) {
      paths.add(bucket);
    }
    else {
      for (const field of visibleFields(sub)) {
        paths.add(profileFieldPath(field));
      }
    }
  }
  return [...paths];
}

/** True when a section only carries the workflow remarks sub-section. */
export function isRemarksOnlySection(section: IFrmSect): boolean {
  const subs = visibleSubSects(section);
  return subs.length > 0 && subs.every(s => bucketForSubSect(s) === 'remarks');
}
