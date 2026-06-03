import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Button,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import {
  useForm,
  useWatch,
  type Control,
  type Path,
  type Resolver,
} from 'react-hook-form';
import type { IFrmSect, IFrmSubSect, IFrmTmplSerialized } from '~/lib/types/conf';
import type { ICountry, IKycFormValues, ISegment } from '~/lib/types/kyc';
import {
  bucketForSubSect,
  sectionValidationPaths,
  visibleFields,
  visibleSections,
  visibleSubSects,
} from './dynamicForm';
import DynamicSubSection from './DynamicSubSection';
import ReviewStep from './ReviewStep';
import { buildKycSchema, kycFormDefaults } from './schema';

const REVIEW_STEP_LABEL = 'Review & Submit';

interface MakerStageFormProps {
  /** Flattened, config-driven form template (FrmTmpl.json_config). */
  template: IFrmTmplSerialized
  /** Pre-fill values (e.g. when a rejected Maker stage is reworked). */
  initialValues?: Partial<IKycFormValues>
  countries: ICountry[]
  segments: ISegment[]
  submitting: boolean
  onSubmit: (payload: IKycFormValues, remarks: string) => void | Promise<void>
}

export default function MakerStageForm({
  template,
  initialValues,
  countries,
  segments,
  submitting,
  onSubmit,
}: MakerStageFormProps) {
  const sections = useMemo(
    () => visibleSections(template.form_sections ?? []),
    [template],
  );

  /** The remarks sub-section (workflow.WorkflowStageInstance), if templated. */
  const remarksSubSect: IFrmSubSect | undefined = useMemo(() => {
    for (const section of sections) {
      const sub = visibleSubSects(section).find(
        s => bucketForSubSect(s) === 'remarks',
      );
      if (sub) return sub;
    }
    return undefined;
  }, [sections]);

  const remarksField = remarksSubSect
    ? visibleFields(remarksSubSect)[0]
    : undefined;

  const steps = useMemo(
    () => [...sections.map(s => s.name), REVIEW_STEP_LABEL],
    [sections],
  );

  /** Validation schema generated from the template's field rules. */
  const schema = useMemo(() => buildKycSchema(template), [template]);

  const [subStep, setSubStep] = useState(0);
  const [remarks, setRemarks] = useState('');

  const {
    control,
    handleSubmit,
    trigger,
    setValue,
  } = useForm<IKycFormValues>({
    resolver: yupResolver(schema) as Resolver<IKycFormValues>,
    defaultValues: { ...kycFormDefaults, ...initialValues },
    mode: 'onTouched',
  });

  const isReviewStep = subStep === steps.length - 1;
  const currentSection: IFrmSect | undefined = sections[subStep];

  const handleNext = async () => {
    const paths = currentSection ? sectionValidationPaths(currentSection) : [];
    const valid = paths.length === 0
      ? true
      : await trigger(paths as Path<IKycFormValues>[]);
    if (valid) setSubStep(s => Math.min(s + 1, steps.length - 1));
  };

  const handleBack = () => setSubStep(s => Math.max(s - 1, 0));

  // Pass the full values (including real File objects) so the orchestrator
  // can persist domain resources and upload documents.
  const submit = handleSubmit(values => onSubmit(values, remarks));

  const remarksBox = (
    <TextField
      label={remarksField?.name ?? 'Remarks to checker'}
      value={remarks}
      onChange={e => setRemarks(e.target.value)}
      helperText={remarksField?.rules?.help}
      required={remarksField?.rules?.required}
      fullWidth
      multiline
      minRows={2}
    />
  );

  return (
    <Stack spacing={2}>
      <Stepper activeStep={subStep} alternativeLabel>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 1 }}>
        {!isReviewStep && currentSection && (
          <Stack spacing={3}>
            {currentSection.description && (
              <Typography variant="body2" color="text.secondary">
                {currentSection.description}
              </Typography>
            )}
            {visibleSubSects(currentSection).map((sub) => {
              if (bucketForSubSect(sub) === 'remarks') {
                return <Box key={sub.id}>{remarksBox}</Box>;
              }
              return (
                <DynamicSubSection
                  key={sub.id}
                  sub={sub}
                  control={control}
                  setValue={setValue}
                  countries={countries}
                  segments={segments}
                />
              );
            })}
          </Stack>
        )}

        {isReviewStep && (
          <Stack spacing={2}>
            <ReviewStepContent
              control={control}
              countries={countries}
              segments={segments}
            />
            {/* Only show the remarks box here when it is not templated into a
                section of its own. */}
            {!remarksField && remarksBox}
          </Stack>
        )}
      </Box>

      <Stack direction="row" spacing={1.5} justifyContent="space-between">
        <Button onClick={handleBack} disabled={subStep === 0 || submitting}>
          Back
        </Button>
        {isReviewStep
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

interface ReviewStepContentProps {
  control: Control<IKycFormValues>
  countries: ICountry[]
  segments: ISegment[]
}

function ReviewStepContent({ control, countries, segments }: ReviewStepContentProps) {
  const [
    profile,
    addresses,
    accounts,
    wealthSources,
    documents,
  ] = useWatch({
    control,
    name: ['profile', 'addresses', 'accounts', 'wealthSources', 'documents'],
  });

  const values: IKycFormValues = {
    profile: profile ?? kycFormDefaults.profile,
    addresses: addresses ?? kycFormDefaults.addresses,
    accounts: accounts ?? kycFormDefaults.accounts,
    wealthSources: wealthSources ?? kycFormDefaults.wealthSources,
    documents: documents ?? kycFormDefaults.documents,
  };

  return <ReviewStep values={values} countries={countries} segments={segments} />;
}
