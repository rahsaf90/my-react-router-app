import {
  Alert,
  Button,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { memo } from 'react';
import {
  useFieldArray,
  type Control,
  type FieldErrors,
} from 'react-hook-form';
import { FormSelectField, FormTextField } from '~/components/ui/FormFields';
import type { IKycFormValues } from '~/lib/types/kyc';
import { ACCOUNT_STATUS_OPTIONS, ACCOUNT_TYPE_OPTIONS, defaultAccountRow } from './schema';

/* ------------------------------------------------------------------ */
/*  Single row                                                         */
/* ------------------------------------------------------------------ */
interface AccountRowProps {
  index: number
  control: Control<IKycFormValues>
  canRemove: boolean
  onRemove: (i: number) => void
}

const AccountRow = memo(function AccountRow({
  index,
  control,
  canRemove,
  onRemove,
}: AccountRowProps) {
  return (
    <TableRow>
      <TableCell sx={{ minWidth: 160 }}>
        <FormTextField<IKycFormValues>
          control={control}
          name={`accounts.${index}.acc_num`}
          placeholder="Account #"
          size="small"
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ minWidth: 160 }}>
        <FormTextField<IKycFormValues>
          control={control}
          name={`accounts.${index}.acc_name`}
          placeholder="Account name"
          size="small"
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ minWidth: 140 }}>
        <FormSelectField<IKycFormValues>
          control={control}
          name={`accounts.${index}.acc_type`}
          label="Type"
          size="small"
          fullWidth
        >
          {ACCOUNT_TYPE_OPTIONS.map(o => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </FormSelectField>
      </TableCell>
      <TableCell sx={{ minWidth: 100 }}>
        <FormTextField<IKycFormValues>
          control={control}
          name={`accounts.${index}.currency`}
          placeholder="CCY"
          size="small"
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ minWidth: 140 }}>
        <FormTextField<IKycFormValues>
          control={control}
          name={`accounts.${index}.branch`}
          placeholder="Branch"
          size="small"
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ minWidth: 140 }}>
        <FormTextField<IKycFormValues>
          control={control}
          name={`accounts.${index}.opened_date`}
          type="date"
          size="small"
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </TableCell>
      <TableCell sx={{ minWidth: 130 }}>
        <FormTextField<IKycFormValues>
          control={control}
          name={`accounts.${index}.balance`}
          type="number"
          placeholder="Balance"
          size="small"
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ minWidth: 120 }}>
        <FormSelectField<IKycFormValues>
          control={control}
          name={`accounts.${index}.status`}
          label="Status"
          size="small"
          fullWidth
        >
          {ACCOUNT_STATUS_OPTIONS.map(o => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </FormSelectField>
      </TableCell>
      <TableCell align="right">
        <Button
          variant="text"
          color="error"
          size="small"
          onClick={() => onRemove(index)}
          disabled={!canRemove}
        >
          Remove
        </Button>
      </TableCell>
    </TableRow>
  );
});

/* ------------------------------------------------------------------ */
/*  Step component                                                     */
/* ------------------------------------------------------------------ */
interface AccountDetailsStepProps {
  control: Control<IKycFormValues>
  errors: FieldErrors<IKycFormValues>
}

export default function AccountDetailsStep({
  control,
  errors,
}: AccountDetailsStepProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'accounts',
    keyName: 'rowId',
  });

  const arrayError = errors.accounts && !Array.isArray(errors.accounts)
    ? errors.accounts.message ?? ''
    : '';

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">
          Account Details (
          {fields.length}
          )
        </Typography>
        <Button
          variant="outlined"
          onClick={() => append(defaultAccountRow)}
        >
          Add Account
        </Button>
      </Stack>

      {arrayError && <Alert severity="error">{arrayError}</Alert>}

      <TableContainer sx={{ maxHeight: 400, overflowY: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Account #</TableCell>
              <TableCell>Account Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Branch</TableCell>
              <TableCell>Opened Date</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field, index) => (
              <AccountRow
                key={field.rowId}
                index={index}
                control={control}
                canRemove={fields.length > 1}
                onRemove={remove}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
