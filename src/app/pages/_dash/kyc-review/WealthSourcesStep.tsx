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
import type { ICountry, IKycFormValues } from '~/lib/types/kyc';
import { defaultWealthSourceRow, WEALTH_SOURCE_OPTIONS } from './schema';

/* ------------------------------------------------------------------ */
/*  Single row                                                         */
/* ------------------------------------------------------------------ */
interface WealthRowProps {
  index: number
  control: Control<IKycFormValues>
  countries: ICountry[]
  canRemove: boolean
  onRemove: (i: number) => void
}

const WealthRow = memo(function WealthRow({
  index,
  control,
  countries,
  canRemove,
  onRemove,
}: WealthRowProps) {
  return (
    <TableRow>
      <TableCell sx={{ minWidth: 170 }}>
        <FormSelectField<IKycFormValues>
          control={control}
          name={`wealthSources.${index}.source_type`}
          label="Source"
          size="small"
          fullWidth
        >
          {WEALTH_SOURCE_OPTIONS.map(o => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </FormSelectField>
      </TableCell>
      <TableCell sx={{ minWidth: 200 }}>
        <FormTextField<IKycFormValues>
          control={control}
          name={`wealthSources.${index}.description`}
          placeholder="Description"
          size="small"
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ minWidth: 140 }}>
        <FormTextField<IKycFormValues>
          control={control}
          name={`wealthSources.${index}.amount`}
          type="number"
          placeholder="Amount"
          size="small"
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ minWidth: 100 }}>
        <FormTextField<IKycFormValues>
          control={control}
          name={`wealthSources.${index}.currency`}
          placeholder="CCY"
          size="small"
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ minWidth: 150 }}>
        <FormSelectField<IKycFormValues>
          control={control}
          name={`wealthSources.${index}.country`}
          label="Country"
          size="small"
          fullWidth
        >
          <MenuItem value=""><em>None</em></MenuItem>
          {countries.map(c => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </FormSelectField>
      </TableCell>
      <TableCell sx={{ minWidth: 160 }}>
        <FormTextField<IKycFormValues>
          control={control}
          name={`wealthSources.${index}.proof_ref`}
          placeholder="Proof reference"
          size="small"
          fullWidth
        />
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
interface WealthSourcesStepProps {
  control: Control<IKycFormValues>
  errors: FieldErrors<IKycFormValues>
  countries: ICountry[]
}

export default function WealthSourcesStep({
  control,
  errors,
  countries,
}: WealthSourcesStepProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'wealthSources',
    keyName: 'rowId',
  });

  const arrayError = errors.wealthSources && !Array.isArray(errors.wealthSources)
    ? errors.wealthSources.message ?? ''
    : '';

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">
          Sources of Wealth (
          {fields.length}
          )
        </Typography>
        <Button
          variant="outlined"
          onClick={() => append(defaultWealthSourceRow)}
        >
          Add Source
        </Button>
      </Stack>

      {arrayError && <Alert severity="error">{arrayError}</Alert>}

      <TableContainer sx={{ maxHeight: 400, overflowY: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Source Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Proof Ref</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field, index) => (
              <WealthRow
                key={field.rowId}
                index={index}
                control={control}
                countries={countries}
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
