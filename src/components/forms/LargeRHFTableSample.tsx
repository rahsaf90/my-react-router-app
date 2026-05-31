import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { memo, useMemo, useState } from 'react';
import {
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type FieldErrors,
  type FieldPath,
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

const VIRTUAL_ROW_HEIGHT = 84;
const VIRTUAL_CONTAINER_HEIGHT = 360;
const VIRTUAL_OVERSCAN = 3;

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

const TotalsSummary = memo(function TotalsSummary(
  { control }: { control: Control<LargeFormValues> },
) {
  const watchedItems = useWatch({ control, name: 'items' });

  const totals = (watchedItems ?? []).reduce(
    (acc, row) => {
      const qty = Number(row?.qty ?? 0);
      const unitPrice = Number(row?.unitPrice ?? 0);
      const discount = Number(row?.discount ?? 0);
      const lineTotal = qty * unitPrice;

      acc.subTotal += lineTotal;
      acc.discountAmount += (lineTotal * discount) / 100;
      return acc;
    },
    { subTotal: 0, discountAmount: 0 },
  );

  const grandTotal = totals.subTotal - totals.discountAmount;

  return (
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
        {grandTotal.toFixed(2)}
      </Typography>
    </Stack>
  );
});

interface VirtualizedLineItemsTableProps {
  fields: { rowId: string }[]
  control: Control<LargeFormValues>
  onRemove: (index: number) => void
  onAppend: () => void
  arrayErrorMessage: string
}

const VirtualizedLineItemsTable = memo(function VirtualizedLineItemsTable({
  fields,
  control,
  onRemove,
  onAppend,
  arrayErrorMessage,
}: VirtualizedLineItemsTableProps) {
  const [scrollTop, setScrollTop] = useState(0);

  const { startIndex, endIndex, topSpacerHeight, bottomSpacerHeight } = useMemo(() => {
    const visibleCount = Math.ceil(VIRTUAL_CONTAINER_HEIGHT / VIRTUAL_ROW_HEIGHT);
    const start = Math.max(0, Math.floor(scrollTop / VIRTUAL_ROW_HEIGHT) - VIRTUAL_OVERSCAN);
    const end = Math.min(fields.length, start + visibleCount + VIRTUAL_OVERSCAN * 2);

    return {
      startIndex: start,
      endIndex: end,
      topSpacerHeight: start * VIRTUAL_ROW_HEIGHT,
      bottomSpacerHeight: Math.max(0, (fields.length - end) * VIRTUAL_ROW_HEIGHT),
    };
  }, [fields.length, scrollTop]);

  const visibleFields = fields.slice(startIndex, endIndex);

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">
          Line items (
          {fields.length}
          )
        </Typography>
        <Button type="button" variant="outlined" onClick={onAppend}>
          Add row
        </Button>
      </Stack>

      {arrayErrorMessage && <Alert severity="error">{arrayErrorMessage}</Alert>}

      <TableContainer
        onScroll={event => setScrollTop(event.currentTarget.scrollTop)}
        sx={{ maxHeight: VIRTUAL_CONTAINER_HEIGHT, overflowY: 'auto' }}
      >
        <Table size="small" stickyHeader>
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
            {topSpacerHeight > 0 && (
              <TableRow>
                <TableCell colSpan={6} sx={{ height: topSpacerHeight, p: 0, borderBottom: 0 }} />
              </TableRow>
            )}

            {visibleFields.map((field, offset) => {
              const index = startIndex + offset;
              return (
                <LineItemRow
                  key={field.rowId}
                  index={index}
                  control={control}
                  canRemove={fields.length > 1}
                  onRemove={onRemove}
                />
              );
            })}

            {bottomSpacerHeight > 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  sx={{ height: bottomSpacerHeight, p: 0, borderBottom: 0 }}
                />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TotalsSummary control={control} />
    </>
  );
});

const wizardSteps = ['Request details', 'Line items', 'Review'];

const stepOneFields: FieldPath<LargeFormValues>[] = [
  'customerName',
  'requesterEmail',
  'projectCode',
  'dueDate',
  'priority',
  'notes',
];

export default function LargeRHFTableSample() {
  const [currentStep, setCurrentStep] = useState(0);

  const methods = useForm<LargeFormValues>({
    resolver: yupResolver(largeFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
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
    getValues,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
    keyName: 'rowId',
  });

  const onSubmit = async (values: LargeFormValues) => {
    console.log('Submitted values', values);
    await new Promise(resolve => setTimeout(resolve, 400));
  };

  const goToPreviousStep = () => {
    setCurrentStep(previous => Math.max(0, previous - 1));
  };

  const goToNextStep = async () => {
    const fieldsToValidate: FieldPath<LargeFormValues>[] = currentStep === 0
      ? stepOneFields
      : ['items'];

    const isStepValid = await trigger(fieldsToValidate);
    if (!isStepValid) return;

    setCurrentStep(previous => Math.min(wizardSteps.length - 1, previous + 1));
  };

  const arrayErrorMessage = getArrayErrorMessage(errors);
  const values = getValues();
  const isFinalStep = currentStep === wizardSteps.length - 1;

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
          <Stepper activeStep={currentStep} sx={{ mb: 3 }}>
            {wizardSteps.map(stepLabel => (
              <Step key={stepLabel}>
                <StepLabel>{stepLabel}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Stack spacing={2}>
            {currentStep === 0 && (
              <>
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
              </>
            )}

            {currentStep === 1 && (
              <VirtualizedLineItemsTable
                fields={fields}
                control={control}
                onRemove={remove}
                onAppend={() => append(defaultLineItem)}
                arrayErrorMessage={arrayErrorMessage}
              />
            )}

            {currentStep === 2 && (
              <Stack spacing={1.5}>
                <Typography variant="h6">Review</Typography>

                <Typography variant="body2">
                  Customer:
                  {' '}
                  {values.customerName || '-'}
                </Typography>
                <Typography variant="body2">
                  Email:
                  {' '}
                  {values.requesterEmail || '-'}
                </Typography>
                <Typography variant="body2">
                  Project code:
                  {' '}
                  {values.projectCode || '-'}
                </Typography>
                <Typography variant="body2">
                  Due date:
                  {' '}
                  {values.dueDate || '-'}
                </Typography>
                <Typography variant="body2">
                  Priority:
                  {' '}
                  {values.priority || '-'}
                </Typography>
                <Typography variant="body2">
                  Notes:
                  {' '}
                  {values.notes || '-'}
                </Typography>

                <Typography variant="body2">
                  Total line items:
                  {' '}
                  {values.items?.length ?? 0}
                </Typography>

                <TotalsSummary control={control} />
              </Stack>
            )}

            <Stack direction="row" justifyContent="flex-end">
              <Stack direction="row" spacing={1.5}>
                <Button
                  type="button"
                  variant="text"
                  onClick={goToPreviousStep}
                  disabled={currentStep === 0 || isSubmitting}
                >
                  Back
                </Button>

                {!isFinalStep && (
                  <Button type="button" variant="contained" onClick={() => void goToNextStep()}>
                    Next
                  </Button>
                )}

                {isFinalStep && (
                  <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save form'}
                  </Button>
                )}
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </FormProvider>
  );
}
