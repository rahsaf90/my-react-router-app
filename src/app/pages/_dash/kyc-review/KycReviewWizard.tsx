import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Box,
  Button,
  Paper,
  Snackbar,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import {
  FormProvider,
  useForm,
  type FieldPath,
  type Resolver,
} from 'react-hook-form';
import {
  useCreateKycReviewMutation,
  useUploadKycDocumentMutation,
} from '~/lib/store/features/apiKyc';
import type { IKycFormValues } from '~/lib/types/kyc';

import AccountDetailsStep from './AccountDetailsStep';
import CustomerInfoStep from './CustomerInfoStep';
import DocumentUploadStep from './DocumentUploadStep';
import ReviewStep from './ReviewStep';
import WealthSourcesStep from './WealthSourcesStep';
import { kycFormDefaults, kycFormSchema } from './schema';

/* ------------------------------------------------------------------ */
/*  Wizard metadata                                                    */
/* ------------------------------------------------------------------ */
const WIZARD_STEPS = [
  'Customer Info',
  'Account Details',
  'Sources of Wealth',
  'Documents',
  'Review & Submit',
];

/** Fields validated when leaving each step */
const STEP_FIELDS: FieldPath<IKycFormValues>[][] = [
  // Step 0 – customer info
  [
    'customerInfo.fullName',
    'customerInfo.dateOfBirth',
    'customerInfo.nationality',
    'customerInfo.nationalId',
    'customerInfo.gender',
    'customerInfo.email',
    'customerInfo.phone',
    'customerInfo.address',
    'customerInfo.city',
    'customerInfo.country',
    'customerInfo.postalCode',
    'customerInfo.occupation',
  ],
  // Step 1 – accounts
  ['accounts'],
  // Step 2 – wealth sources
  ['wealthSources'],
  // Step 3 – documents
  ['documents'],
  // Step 4 – review (no extra validation)
  [],
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function KycReviewWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    severity: 'success' | 'error'
    message: string
  }>({ open: false, severity: 'success', message: '' });

  const [createKycReview] = useCreateKycReviewMutation();
  const [uploadDocument] = useUploadKycDocumentMutation();

  const methods = useForm<IKycFormValues>({
    resolver: yupResolver(kycFormSchema) as unknown as Resolver<IKycFormValues>,
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
    shouldUnregister: false,
    defaultValues: kycFormDefaults,
  });

  const {
    control,
    getValues,
    setValue,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = methods;

  /* ---- Navigation ---- */
  const goBack = () => setCurrentStep(prev => Math.max(0, prev - 1));

  const goNext = async () => {
    const fieldsToValidate = STEP_FIELDS[currentStep];
    if (fieldsToValidate.length > 0) {
      const valid = await trigger(fieldsToValidate);
      if (!valid) return;
    }
    setCurrentStep(prev => Math.min(WIZARD_STEPS.length - 1, prev + 1));
  };

  /* ---- Submit ---- */
  const onSubmit = async (values: IKycFormValues) => {
    try {
      // 1. Create the KYC review via workflow endpoint
      const review = await createKycReview(values).unwrap();

      // 2. Upload documents if any have files attached
      const docsWithFiles = values.documents.filter(d => d.file);
      for (const doc of docsWithFiles) {
        if (doc.file && review.id) {
          await uploadDocument({
            reviewId: String(review.id),
            file: doc.file,
            documentType: doc.documentType,
            notes: doc.notes,
          }).unwrap();
        }
      }

      setSnackbar({
        open: true,
        severity: 'success',
        message: `KYC Review ${review.caseNumber} submitted successfully!`,
      });
    }
    catch {
      setSnackbar({
        open: true,
        severity: 'error',
        message: 'Failed to submit KYC review. Please try again.',
      });
    }
  };

  const isFinalStep = currentStep === WIZARD_STEPS.length - 1;
  const values = getValues();

  return (
    <FormProvider {...methods}>
      <Paper sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          KYC Customer Review
        </Typography>

        <Box
          component="form"
          noValidate
          onSubmit={event => void handleSubmit(onSubmit)(event)}
        >
          {/* Stepper */}
          <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 3 }}>
            {WIZARD_STEPS.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step content */}
          <Box sx={{ minHeight: 320 }}>
            {currentStep === 0 && (
              <CustomerInfoStep control={control} />
            )}

            {currentStep === 1 && (
              <AccountDetailsStep control={control} errors={errors} />
            )}

            {currentStep === 2 && (
              <WealthSourcesStep control={control} errors={errors} />
            )}

            {currentStep === 3 && (
              <DocumentUploadStep
                control={control}
                errors={errors}
                setValue={setValue}
              />
            )}

            {currentStep === 4 && (
              <ReviewStep values={values} />
            )}
          </Box>

          {/* Navigation buttons */}
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
            <Button
              variant="text"
              onClick={goBack}
              disabled={currentStep === 0 || isSubmitting}
            >
              Back
            </Button>

            <Stack direction="row" spacing={1.5}>
              {!isFinalStep && (
                <Button
                  variant="contained"
                  onClick={() => void goNext()}
                >
                  Next
                </Button>
              )}

              {isFinalStep && (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting…' : 'Submit KYC Review'}
                </Button>
              )}
            </Stack>
          </Stack>

          {/* Form-level error banner */}
          {Object.keys(errors).length > 0 && currentStep === 4 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Some steps have validation errors. Please go back and fix them
              before submitting.
            </Alert>
          )}
        </Box>
      </Paper>

      {/* Feedback snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </FormProvider>
  );
}
