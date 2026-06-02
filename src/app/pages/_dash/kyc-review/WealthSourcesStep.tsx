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
import { defaultWealthSourceRow } from './schema';

/* ------------------------------------------------------------------ */
/*  Single row                                                         */
/* ------------------------------------------------------------------ */
interface WealthRowProps {
  index: number
  control: Control<IKycFormValues>
  canRemove: boolean
  onRemove: (i: number) => void
}

const WealthRow = memo(function WealthRow({
  index,
  control,
  canRemove,
  onRemove,
}: WealthRowProps) {
  return (
    <TableRow>
      <TableCell sx={{ minWidth: 150 }}>
        <FormSelectField<IKycFormValues>
          control={control}
          name={`wealthSources.${index}.sourceType`}
          label="Source"
          size="small"
          fullWidth
        >
          <MenuItem value="employment">Employment</MenuItem>
          <MenuItem value="business">Business</MenuItem>
          <MenuItem value="inheritance">Inheritance</MenuItem>
          <MenuItem value="investment">Investment</MenuItem>
          <MenuItem value="property">Property</MenuItem>
          <MenuItem value="gift">Gift</MenuItem>
          <MenuItem value="other">Other</MenuItem>
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
          name={`wealthSources.${index}.estimatedValue`}
          type="number"
          placeholder="Value"
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
      <TableCell sx={{ minWidth: 160 }}>
        <FormTextField<IKycFormValues>
          control={control}
          name={`wealthSources.${index}.evidenceProvided`}
          placeholder="Evidence details"
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
}

export default function WealthSourcesStep({
  control,
  errors,
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
              <TableCell>Estimated Value</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Evidence</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field, index) => (
              <WealthRow
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
