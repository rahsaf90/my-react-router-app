import { yupResolver } from '@hookform/resolvers/yup';
import {
    Alert,
    Box,
    Button,
    MenuItem,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { memo, useMemo } from 'react';
import {
    FormProvider,
    useFieldArray,
    useForm,
    useWatch,
    type Control,
    type FieldErrors,
} from 'react-hook-form';
import * as yup from 'yup';
import { FormSelectField, FormTextField } from '~/components/ui/FormFields';

type Priority = 'low' | 'medium' | 'high';

const lineItemSchema = yup.object({
  sku: yup.string().trim().required('SKU is required'),
  description: yup.string().trim().required('Description is required'),
  qty: yup
    .number()
    .typeError('Quantity must be a number')
    .integer('Quantity must be an integer')
    .min(1, 'Minimum quantity is 1')
    .required('Quantity is required'),
  unitPrice: yup
    .number()
    .typeError('Unit price must be a number')
    .min(0, 'Unit price cannot be negative')
    .required('Unit price is required'),
  discount: yup
    .number()
    .typeError('Discount must be a number')
    .min(0, 'Discount cannot be negative')
    .max(100, 'Discount cannot exceed 100%')
    .default(0),
});

const largeFormSchema = yup.object({
  customerName: yup.string().trim().required('Customer name is required'),
  requesterEmail: yup
    .string()
    .trim()
    .email('Enter a valid email address')
    .required('Requester email is required'),
  projectCode: yup.string().trim().required('Project code is required'),
  dueDate: yup.string().trim().required('Due date is required'),
  priority: yup
    .mixed<Priority>()
    .oneOf(['low', 'medium', 'high'], 'Priority is required')
    .required('Priority is required'),
  notes: yup.string().max(1000, 'Notes cannot exceed 1000 characters').default(''),
  items: yup
    .array()
    .of(lineItemSchema)
    .min(1, 'Add at least one line item')
    .required('At least one line item is required'),
});

type LargeFormValues = yup.InferType<typeof largeFormSchema>;

const defaultLineItem: LargeFormValues['items'][number] = {
  sku: '',
  description: '',
  qty: 1,
  unitPrice: 0,
  discount: 0,
};

interface LineItemRowProps {
  index: number
  control: Control<LargeFormValues>
  canRemove: boolean
  onRemove: (index: number) => void
}

const LineItemRow = memo(function LineItemRow({
  index,
  control,
  canRemove,
  onRemove,
}: LineItemRowProps) {
  return (
    <TableRow>
      <TableCell sx={{ minWidth: 160 }}>
        <FormTextField<LargeFormValues>
          control={control}
          name={`items.${index}.sku` as const}
          placeholder="SKU"
          size="small"
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ minWidth: 260 }}>
        <FormTextField<LargeFormValues>
          control={control}
          name={`items.${index}.description` as const}
          placeholder="Description"
          size="small"
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ minWidth: 120 }}>
        <FormTextField<LargeFormValues>
          control={control}
          name={`items.${index}.qty` as const}
          type="number"
          placeholder="Qty"
          size="small"
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ minWidth: 140 }}>
        <FormTextField<LargeFormValues>
          control={control}
          name={`items.${index}.unitPrice` as const}
          type="number"
          placeholder="Unit price"
          size="small"
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ minWidth: 140 }}>
        <FormTextField<LargeFormValues>
          control={control}
          name={`items.${index}.discount` as const}
          type="number"
          placeholder="Discount %"
          size="small"
          fullWidth
        />
      </TableCell>
      <TableCell align="right">
        <Button
          variant="text"
          color="error"
          onClick={() => onRemove(index)}
          disabled={!canRemove}
        >
          Remove
        </Button>
      </TableCell>
    </TableRow>
  );
});

function getArrayErrorMessage(errors: FieldErrors<LargeFormValues>) {
  const itemsError = errors.items;
  if (!itemsError) return '';
  if (Array.isArray(itemsError)) return '';
  return itemsError.message ?? '';
}

export default function LargeRHFTableSample() {
  const methods = useForm<LargeFormValues>({
    resolver: yupResolver(largeFormSchema),
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      customerName: '',
      requesterEmail: '',
      projectCode: '',
      dueDate: '',
      priority: 'medium',
      notes: '',
      items: [defaultLineItem],
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
    keyName: 'rowId',
  });

  const watchedItems = useWatch({ control, name: 'items' });

  const totals = useMemo(() => {
    const subTotal = (watchedItems ?? []).reduce((sum, row) => {
      const qty = Number(row?.qty ?? 0);
      const unitPrice = Number(row?.unitPrice ?? 0);
      return sum + qty * unitPrice;
    }, 0);

    const discountAmount = (watchedItems ?? []).reduce((sum, row) => {
      const qty = Number(row?.qty ?? 0);
      const unitPrice = Number(row?.unitPrice ?? 0);
      const discount = Number(row?.discount ?? 0);
      return sum + (qty * unitPrice * discount) / 100;
    }, 0);

    return {
      subTotal,
      discountAmount,
      grandTotal: subTotal - discountAmount,
    };
  }, [watchedItems]);

  const onSubmit = async (values: LargeFormValues) => {
    console.log('Submitted values', values);
    await new Promise(resolve => setTimeout(resolve, 400));
  };

  const arrayErrorMessage = getArrayErrorMessage(errors);

  return (
    <FormProvider {...methods}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Large RHF + Yup Form Sample
        </Typography>

        <Box
          component="form"
          noValidate
          onSubmit={event => void handleSubmit(onSubmit)(event)}
        >
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormTextField<LargeFormValues>
                control={control}
                name="customerName"
                label="Customer name"
                fullWidth
                required
              />
              <FormTextField<LargeFormValues>
                control={control}
                name="requesterEmail"
                label="Requester email"
                fullWidth
                required
              />
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormTextField<LargeFormValues>
                control={control}
                name="projectCode"
                label="Project code"
                fullWidth
                required
              />
              <FormTextField<LargeFormValues>
                control={control}
                name="dueDate"
                label="Due date"
                type="date"
                fullWidth
                required
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <FormSelectField<LargeFormValues>
                control={control}
                name="priority"
                label="Priority"
                fullWidth
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </FormSelectField>
            </Stack>

            <FormTextField<LargeFormValues>
              control={control}
              name="notes"
              label="Notes"
              multiline
              minRows={3}
              fullWidth
            />

            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Line items</Typography>
              <Button
                type="button"
                variant="outlined"
                onClick={() => append(defaultLineItem)}
              >
                Add row
              </Button>
            </Stack>

            {arrayErrorMessage && <Alert severity="error">{arrayErrorMessage}</Alert>}

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>SKU</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Qty</TableCell>
                    <TableCell>Unit price</TableCell>
                    <TableCell>Discount %</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fields.map((field, index) => (
                    <LineItemRow
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

            <Stack alignItems="flex-end" spacing={0.5}>
              <Typography variant="body2">
                Subtotal:
                {' '}
                {totals.subTotal.toFixed(2)}
              </Typography>
              <Typography variant="body2">
                Discount:
                {' '}
                {totals.discountAmount.toFixed(2)}
              </Typography>
              <Typography variant="subtitle1">
                Grand total:
                {' '}
                {totals.grandTotal.toFixed(2)}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="flex-end">
              <Button type="submit" variant="contained" disabled={!isValid || isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save form'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </FormProvider>
  );
}
