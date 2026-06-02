import { yupResolver } from '@hookform/resolvers/yup';
import {
    Box,
    Button,
    Stack,
    Step,
    StepLabel,
    Stepper,
    TextField,
} from '@mui/material';
import { useState } from 'react';
import { useForm, type Path, type Resolver } from 'react-hook-form';
import {
    useGetCountriesQuery,
    useGetSegmentsQuery,
} from '~/lib/store/features/apiKyc';
import type { IKycFormValues } from '~/lib/types/kyc';
import AccountDetailsStep from './AccountDetailsStep';
import AddressStep from './AddressStep';
import CustomerInfoStep from './CustomerInfoStep';
import DocumentUploadStep from './DocumentUploadStep';
import ReviewStep from './ReviewStep';
import { kycFormDefaults, kycFormSchema } from './schema';
import WealthSourcesStep from './WealthSourcesStep';

/* ------------------------------------------------------------------ */
/*  Sub-steps within the Maker workflow stage                          */
/* ------------------------------------------------------------------ */
const SUB_STEPS = [
  'Demographics',
  'Addresses',
  'Accounts',
  'Sources of Wealth',
  'Documents',
  'Review & Submit',
] as const;

/** Fields validated before leaving each sub-step. */
const STEP_FIELDS: Path<IKycFormValues>[][] = [
  ['profile'],
  ['addresses'],
  ['accounts'],
  ['wealthSources'],
  ['documents'],
  [],
];

interface MakerStageFormProps {
  /** Pre-fill values (e.g. when a rejected Maker stage is reworked). */
  initialValues?: Partial<IKycFormValues>
  submitting: boolean
  onSubmit: (payload: IKycFormValues, remarks: string) => void | Promise<void>
}

export default function MakerStageForm({
  initialValues,
  submitting,
  onSubmit,
}: MakerStageFormProps) {
  const [subStep, setSubStep] = useState(0);
  const [remarks, setRemarks] = useState('');

  const { data: countriesResp } = useGetCountriesQuery();
  const { data: segmentsResp } = useGetSegmentsQuery();
  const countries = countriesResp?.results ?? [];
  const segments = segmentsResp?.results ?? [];

  const {
    control,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IKycFormValues>({
    resolver: yupResolver(kycFormSchema) as Resolver<IKycFormValues>,
    defaultValues: { ...kycFormDefaults, ...initialValues },
    mode: 'onTouched',
  });

  const isLast = subStep === SUB_STEPS.length - 1;

  const handleNext = async () => {
    const fields = STEP_FIELDS[subStep];
    const valid = fields.length === 0 ? true : await trigger(fields);
    if (valid) setSubStep(s => Math.min(s + 1, SUB_STEPS.length - 1));
  };

  const handleBack = () => setSubStep(s => Math.max(s - 1, 0));

  // Pass the full values (including real File objects) so the orchestrator
  // can persist domain resources and upload documents.
  const submit = handleSubmit(values => onSubmit(values, remarks));

  const values = watch();

  return (
    <Stack spacing={2}>
      <Stepper activeStep={subStep} alternativeLabel>
        {SUB_STEPS.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 1 }}>
        {subStep === 0 && (
          <CustomerInfoStep control={control} countries={countries} segments={segments} />
        )}
        {subStep === 1 && (
          <AddressStep control={control} errors={errors} countries={countries} />
        )}
        {subStep === 2 && <AccountDetailsStep control={control} errors={errors} />}
        {subStep === 3 && (
          <WealthSourcesStep control={control} errors={errors} countries={countries} />
        )}
        {subStep === 4 && (
          <DocumentUploadStep control={control} errors={errors} setValue={setValue} />
        )}
        {subStep === 5 && (
          <Stack spacing={2}>
            <ReviewStep values={values} countries={countries} segments={segments} />
            <TextField
              label="Remarks to checker"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        )}
      </Box>

      <Stack direction="row" spacing={1.5} justifyContent="space-between">
        <Button onClick={handleBack} disabled={subStep === 0 || submitting}>
          Back
        </Button>
        {isLast
          ? (
              <Button
                variant="contained"
                onClick={() => void submit()}
                disabled={submitting}
              >
                {submitting ? 'Submitting…' : 'Submit to Checker'}
              </Button>
            )
          : (
              <Button
                variant="contained"
                onClick={() => void handleNext()}
                disabled={submitting}
              >
                Next
              </Button>
            )}
      </Stack>
    </Stack>
  );
}
