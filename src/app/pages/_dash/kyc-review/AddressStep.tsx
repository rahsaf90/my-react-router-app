import {
    Alert,
    Button,
    Checkbox,
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
    Controller,
    useFieldArray,
    type Control,
    type FieldErrors,
} from 'react-hook-form';
import { FormSelectField, FormTextField } from '~/components/ui/FormFields';
import type { ICountry, IKycFormValues } from '~/lib/types/kyc';
import { ADDRESS_TYPE_OPTIONS, defaultAddressRow } from './schema';

/* ------------------------------------------------------------------ */
/*  Single row                                                         */
/* ------------------------------------------------------------------ */
interface AddressRowProps {
  index: number
  control: Control<IKycFormValues>
  countries: ICountry[]
  onRemove: (i: number) => void
}

const AddressRow = memo(function AddressRow({
  index,
  control,
  countries,
  onRemove,
}: AddressRowProps) {
  return (
    <TableRow>
      <TableCell sx={{ minWidth: 140 }}>
        <FormSelectField<IKycFormValues>
          control={control}
          name={`addresses.${index}.address_type`}
          label="Type"
          size="small"
          fullWidth
        >
          {ADDRESS_TYPE_OPTIONS.map(o => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </FormSelectField>
      </TableCell>
      <TableCell sx={{ minWidth: 180 }}>
        <FormTextField<IKycFormValues>
          control={control}
          name={`addresses.${index}.line1`}
          placeholder="Line 1"
          size="small"
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ minWidth: 160 }}>
        <FormTextField<IKycFormValues>
          control={control}
          name={`addresses.${index}.line2`}
          placeholder="Line 2"
          size="small"
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ minWidth: 130 }}>
        <FormTextField<IKycFormValues>
          control={control}
          name={`addresses.${index}.city`}
          placeholder="City"
          size="small"
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ minWidth: 120 }}>
        <FormTextField<IKycFormValues>
          control={control}
          name={`addresses.${index}.state`}
          placeholder="State"
          size="small"
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ minWidth: 100 }}>
        <FormTextField<IKycFormValues>
          control={control}
          name={`addresses.${index}.zipcode`}
          placeholder="Zip"
          size="small"
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ minWidth: 150 }}>
        <FormSelectField<IKycFormValues>
          control={control}
          name={`addresses.${index}.country`}
          label="Country"
          size="small"
          fullWidth
        >
          {countries.map(c => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </FormSelectField>
      </TableCell>
      <TableCell align="center">
        <Controller
          control={control}
          name={`addresses.${index}.is_primary`}
          render={({ field }) => (
            <Checkbox
              checked={!!field.value}
              onChange={e => field.onChange(e.target.checked)}
              size="small"
            />
          )}
        />
      </TableCell>
      <TableCell align="right">
        <Button
          variant="text"
          color="error"
          size="small"
          onClick={() => onRemove(index)}
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
interface AddressStepProps {
  control: Control<IKycFormValues>
  errors: FieldErrors<IKycFormValues>
  countries: ICountry[]
}

export default function AddressStep({ control, errors, countries }: AddressStepProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'addresses',
    keyName: 'rowId',
  });

  const arrayError = errors.addresses && !Array.isArray(errors.addresses)
    ? errors.addresses.message ?? ''
    : '';

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">{`Addresses (${fields.length})`}</Typography>
        <Button variant="outlined" onClick={() => append(defaultAddressRow)}>
          Add Address
        </Button>
      </Stack>

      {arrayError && <Alert severity="error">{arrayError}</Alert>}

      {fields.length === 0
        ? (
            <Alert severity="info">
              No addresses added. A country is required for each address row.
            </Alert>
          )
        : (
            <TableContainer sx={{ maxHeight: 400, overflowY: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Line 1</TableCell>
                    <TableCell>Line 2</TableCell>
                    <TableCell>City</TableCell>
                    <TableCell>State</TableCell>
                    <TableCell>Zip</TableCell>
                    <TableCell>Country</TableCell>
                    <TableCell align="center">Primary</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fields.map((field, index) => (
                    <AddressRow
                      key={field.rowId}
                      index={index}
                      control={control}
                      countries={countries}
                      onRemove={remove}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
    </Stack>
  );
}
