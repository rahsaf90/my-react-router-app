import { MenuItem, Stack } from '@mui/material';
import type { Control } from 'react-hook-form';
import { FormSelectField, FormTextField } from '~/components/ui/FormFields';
import type { IKycFormValues } from '~/lib/types/kyc';

interface CustomerInfoStepProps {
  control: Control<IKycFormValues>
}

export default function CustomerInfoStep({ control }: CustomerInfoStepProps) {
  return (
    <Stack spacing={2}>
      {/* Row 1 – Name & DOB */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <FormTextField<IKycFormValues>
          control={control}
          name="customerInfo.fullName"
          label="Full Name"
          fullWidth
          required
        />
        <FormTextField<IKycFormValues>
          control={control}
          name="customerInfo.dateOfBirth"
          label="Date of Birth"
          type="date"
          fullWidth
          required
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Stack>

      {/* Row 2 – Nationality, National ID, Gender */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <FormTextField<IKycFormValues>
          control={control}
          name="customerInfo.nationality"
          label="Nationality"
          fullWidth
          required
        />
        <FormTextField<IKycFormValues>
          control={control}
          name="customerInfo.nationalId"
          label="National / Passport ID"
          fullWidth
          required
        />
        <FormSelectField<IKycFormValues>
          control={control}
          name="customerInfo.gender"
          label="Gender"
          fullWidth
        >
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="female">Female</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </FormSelectField>
      </Stack>

      {/* Row 3 – Email & Phone */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <FormTextField<IKycFormValues>
          control={control}
          name="customerInfo.email"
          label="Email Address"
          type="email"
          fullWidth
          required
        />
        <FormTextField<IKycFormValues>
          control={control}
          name="customerInfo.phone"
          label="Phone Number"
          fullWidth
          required
        />
      </Stack>

      {/* Row 4 – Address */}
      <FormTextField<IKycFormValues>
        control={control}
        name="customerInfo.address"
        label="Address"
        fullWidth
        required
      />

      {/* Row 5 – City, Country, Postal Code */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <FormTextField<IKycFormValues>
          control={control}
          name="customerInfo.city"
          label="City"
          fullWidth
          required
        />
        <FormTextField<IKycFormValues>
          control={control}
          name="customerInfo.country"
          label="Country"
          fullWidth
          required
        />
        <FormTextField<IKycFormValues>
          control={control}
          name="customerInfo.postalCode"
          label="Postal Code"
          fullWidth
          required
        />
      </Stack>

      {/* Row 6 – Occupation & Employer */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <FormTextField<IKycFormValues>
          control={control}
          name="customerInfo.occupation"
          label="Occupation"
          fullWidth
          required
        />
        <FormTextField<IKycFormValues>
          control={control}
          name="customerInfo.employerName"
          label="Employer Name"
          fullWidth
        />
      </Stack>
    </Stack>
  );
}
