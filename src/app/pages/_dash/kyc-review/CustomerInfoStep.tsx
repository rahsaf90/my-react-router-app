import { Divider, MenuItem, Stack, Typography } from '@mui/material';
import type { Control } from 'react-hook-form';
import { FormSelectField, FormTextField } from '~/components/ui/FormFields';
import type { ICountry, IKycFormValues, ISegment } from '~/lib/types/kyc';
import { GENDER_OPTIONS, MARITAL_STATUS_OPTIONS } from './schema';

interface CustomerInfoStepProps {
  control: Control<IKycFormValues>
  countries: ICountry[]
  segments: ISegment[]
}

export default function CustomerInfoStep({
  control,
  countries,
  segments,
}: CustomerInfoStepProps) {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" color="text.secondary">Identity</Typography>

      {/* Row 1 – Customer reference & full name */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <FormTextField<IKycFormValues>
          control={control}
          name="profile.cus_id"
          label="Customer ID / Reference"
          fullWidth
        />
        <FormTextField<IKycFormValues>
          control={control}
          name="profile.name"
          label="Full Name"
          fullWidth
          required
        />
      </Stack>

      {/* Row 2 – Name parts */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <FormTextField<IKycFormValues>
          control={control}
          name="profile.first_name"
          label="First Name"
          fullWidth
        />
        <FormTextField<IKycFormValues>
          control={control}
          name="profile.middle_name"
          label="Middle Name"
          fullWidth
        />
        <FormTextField<IKycFormValues>
          control={control}
          name="profile.last_name"
          label="Last Name"
          fullWidth
        />
      </Stack>

      {/* Row 3 – DOB, gender, marital status */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <FormTextField<IKycFormValues>
          control={control}
          name="profile.dob"
          label="Date of Birth"
          type="date"
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <FormSelectField<IKycFormValues>
          control={control}
          name="profile.gender"
          label="Gender"
          fullWidth
        >
          <MenuItem value=""><em>None</em></MenuItem>
          {GENDER_OPTIONS.map(o => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </FormSelectField>
        <FormSelectField<IKycFormValues>
          control={control}
          name="profile.marital_status"
          label="Marital Status"
          fullWidth
        >
          <MenuItem value=""><em>None</em></MenuItem>
          {MARITAL_STATUS_OPTIONS.map(o => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </FormSelectField>
      </Stack>

      {/* Row 4 – Nationality & country of birth */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <FormSelectField<IKycFormValues>
          control={control}
          name="profile.nationality"
          label="Nationality"
          fullWidth
        >
          <MenuItem value=""><em>None</em></MenuItem>
          {countries.map(c => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </FormSelectField>
        <FormSelectField<IKycFormValues>
          control={control}
          name="profile.country_of_birth"
          label="Country of Birth"
          fullWidth
        >
          <MenuItem value=""><em>None</em></MenuItem>
          {countries.map(c => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </FormSelectField>
      </Stack>

      {/* Row 5 – Occupation & employer */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <FormTextField<IKycFormValues>
          control={control}
          name="profile.occupation"
          label="Occupation"
          fullWidth
        />
        <FormTextField<IKycFormValues>
          control={control}
          name="profile.employer_name"
          label="Employer Name"
          fullWidth
        />
      </Stack>

      <Divider />
      <Typography variant="subtitle2" color="text.secondary">Contact</Typography>

      {/* Row 6 – Email & mobile */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <FormTextField<IKycFormValues>
          control={control}
          name="profile.email"
          label="Email Address"
          type="email"
          fullWidth
        />
        <FormTextField<IKycFormValues>
          control={control}
          name="profile.mobile"
          label="Mobile Number"
          fullWidth
        />
      </Stack>

      {/* Row 7 – Address line */}
      <FormTextField<IKycFormValues>
        control={control}
        name="profile.address"
        label="Address"
        fullWidth
        multiline
        minRows={2}
      />

      {/* Row 8 – City, state, country, zipcode */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <FormTextField<IKycFormValues>
          control={control}
          name="profile.city"
          label="City"
          fullWidth
        />
        <FormSelectField<IKycFormValues>
          control={control}
          name="profile.state"
          label="State / Segment"
          fullWidth
        >
          <MenuItem value=""><em>None</em></MenuItem>
          {segments.map(s => (
            <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
          ))}
        </FormSelectField>
        <FormSelectField<IKycFormValues>
          control={control}
          name="profile.country"
          label="Country"
          fullWidth
        >
          <MenuItem value=""><em>None</em></MenuItem>
          {countries.map(c => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </FormSelectField>
        <FormTextField<IKycFormValues>
          control={control}
          name="profile.zipcode"
          label="Zip / Postal Code"
          fullWidth
        />
      </Stack>

      <Divider />
      <Typography variant="subtitle2" color="text.secondary">Passport</Typography>

      {/* Row 9 – Passport details */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <FormTextField<IKycFormValues>
          control={control}
          name="profile.passport_no"
          label="Passport Number"
          fullWidth
        />
        <FormSelectField<IKycFormValues>
          control={control}
          name="profile.passport_country"
          label="Passport Country"
          fullWidth
        >
          <MenuItem value=""><em>None</em></MenuItem>
          {countries.map(c => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </FormSelectField>
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <FormTextField<IKycFormValues>
          control={control}
          name="profile.passport_issue_date"
          label="Passport Issue Date"
          type="date"
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <FormTextField<IKycFormValues>
          control={control}
          name="profile.passport_expiry_date"
          label="Passport Expiry Date"
          type="date"
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Stack>
    </Stack>
  );
}
