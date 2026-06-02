import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  Snackbar,
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
  TextField,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import {
  useAdvanceWorkflowMutation,
  useCancelWorkflowMutation,
  useCreateCoreProfileMutation,
  useCreateCusAccountMutation,
  useCreateCustomerAddressMutation,
  useCreateSourceOfWealthMutation,
  useGetCoreProfilesQuery,
  useGetCountriesQuery,
  useGetCusAccountsQuery,
  useGetCustomerAddressesQuery,
  useGetSegmentsQuery,
  useGetSourcesOfWealthQuery,
  useGetTaskDocumentsQuery,
  useGetTaskQuery,
  useGetWorkflowDefinitionsQuery,
  useGetWorkflowInstancesQuery,
  useGetWorkflowLogsQuery,
  useRollbackWorkflowMutation,
  useStartWorkflowMutation,
  useUploadTaskDocumentMutation,
} from '~/lib/store/features/apiKyc';
import type {
  IKycFormValues,
  IWorkflowInstance,
  IWorkflowStageInstance,
  StageStatus,
  WorkflowStatus,
} from '~/lib/types/kyc';
import MakerStageForm from './MakerStageForm';
import {
  domainToFormValues,
  toCoreProfileCreate,
  toCusAccountCreate,
  toCustomerAddressCreate,
  toSourceOfWealthCreate,
} from './mappers';
import ReviewStep from './ReviewStep';

interface KycReviewWizardProps {
  /** kyc.Task primary key the workflow is (or will be) bound to. */
  taskId?: string
}

type ChipColor = 'default' | 'success' | 'error' | 'warning' | 'info';

/* ------------------------------------------------------------------ */
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */
const WORKFLOW_STATUS_COLOR: Record<WorkflowStatus, ChipColor> = {
  'Initiated': 'info',
  'In Progress': 'info',
  'Completed': 'success',
  'Cancelled': 'default',
  'Failed': 'error',
};

const STAGE_STATUS_COLOR: Record<StageStatus, ChipColor> = {
  'Pending': 'default',
  'Active': 'info',
  'Approved': 'success',
  'Rejected': 'error',
  'Skipped': 'default',
  'Timed Out': 'warning',
};

const TERMINAL_STATUSES: WorkflowStatus[] = ['Completed', 'Cancelled', 'Failed'];

/** Stages that can be sent back for rework (reactivated). */
const REWORKABLE_STATUSES: StageStatus[] = ['Rejected', 'Timed Out'];

function fmtDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function KycReviewWizard({ taskId }: KycReviewWizardProps) {
  const [remarks, setRemarks] = useState('');
  const [selectedDefinitionId, setSelectedDefinitionId] = useState<number | ''>('');
  const [rollbackTargetId, setRollbackTargetId] = useState<number | ''>('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    severity: 'success' | 'error'
    message: string
  }>({ open: false, severity: 'success', message: '' });

  /* ---- Data ---- */
  const { data: instancesResp, isLoading: instancesLoading }
    = useGetWorkflowInstancesQuery({ taskId }, { skip: !taskId });

  const { data: definitionsResp } = useGetWorkflowDefinitionsQuery();

  // The owning org is required on every domain POST and is sourced from the
  // task (CoreProfile/CusAccount/... all carry a non-nullable `org` FK).
  const { data: taskData } = useGetTaskQuery(taskId ?? '', { skip: !taskId });
  const org = taskData?.org;

  // Reference data for FK label resolution in the read-only review.
  const { data: countriesResp } = useGetCountriesQuery();
  const { data: segmentsResp } = useGetSegmentsQuery();
  const countries = countriesResp?.results ?? [];
  const segments = segmentsResp?.results ?? [];

  // Domain resources. These viewsets expose no server-side filtering, so the
  // full (org-scoped) lists are fetched and filtered client-side by task.
  const { data: profilesResp } = useGetCoreProfilesQuery(undefined, { skip: !taskId });
  const { data: addressesResp } = useGetCustomerAddressesQuery(undefined, { skip: !taskId });
  const { data: accountsResp } = useGetCusAccountsQuery(undefined, { skip: !taskId });
  const { data: wealthResp } = useGetSourcesOfWealthQuery(undefined, { skip: !taskId });
  const { data: documentsResp } = useGetTaskDocumentsQuery(undefined, { skip: !taskId });

  // Pick the most recent workflow instance bound to this task.
  const instance: IWorkflowInstance | undefined = useMemo(() => {
    if (!instancesResp || !taskId) return undefined;
    return instancesResp.results
      .filter(wf => wf.task === taskId || wf.entity_id === taskId)
      .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))[0];
  }, [instancesResp, taskId]);

  const { data: logs } = useGetWorkflowLogsQuery(instance?.id ?? 0, {
    skip: !instance?.id,
  });

  /* ---- Mutations ---- */
  const [startWorkflow, { isLoading: starting }] = useStartWorkflowMutation();
  const [advanceWorkflow, { isLoading: advancing }] = useAdvanceWorkflowMutation();
  const [rollbackWorkflow, { isLoading: rollingBack }] = useRollbackWorkflowMutation();
  const [cancelWorkflow, { isLoading: cancelling }] = useCancelWorkflowMutation();
  const [createCoreProfile] = useCreateCoreProfileMutation();
  const [createCustomerAddress] = useCreateCustomerAddressMutation();
  const [createCusAccount] = useCreateCusAccountMutation();
  const [createSourceOfWealth] = useCreateSourceOfWealthMutation();
  const [uploadTaskDocument] = useUploadTaskDocumentMutation();
  const [persisting, setPersisting] = useState(false);

  const busy = [starting, advancing, rollingBack, cancelling, persisting].some(Boolean);

  /* ---- Derived workflow state ---- */
  const stages = useMemo(
    () =>
      [...(instance?.stage_instances ?? [])].sort(
        (a, b) => (a.stage_order ?? 0) - (b.stage_order ?? 0),
      ),
    [instance],
  );

  const activeStep = useMemo(() => {
    if (!instance) return 0;
    const idx = stages.findIndex(s => s.id === instance.current_stage);
    return idx === -1 ? stages.length : idx;
  }, [instance, stages]);

  const currentStage: IWorkflowStageInstance | undefined = useMemo(
    () => stages.find(s => s.id === instance?.current_stage),
    [stages, instance],
  );

  const isTerminal = instance ? TERMINAL_STATUSES.includes(instance.status) : false;
  const canDecide
    = !!instance
      && instance.status === 'In Progress'
      && currentStage?.status === 'Active';
  const reworkableStages = stages.filter(s =>
    REWORKABLE_STATUSES.includes(s.status),
  );

  // The Maker stage captures the KYC review data into the real domain
  // resources (CoreProfile + addresses/accounts/wealth + TaskDocuments).
  // Resolve the CoreProfile for this task (client-side filter — no server
  // filtering available) and assemble a read-only form view from the
  // persisted domain resources for the Checker / rework prefill.
  const coreProfile = useMemo(
    () => profilesResp?.results.find(p => p.task === taskId),
    [profilesResp, taskId],
  );

  const domainData: IKycFormValues | undefined = useMemo(() => {
    if (!coreProfile) return undefined;
    return domainToFormValues({
      profile: coreProfile,
      addresses: (addressesResp?.results ?? []).filter(a => a.profile === coreProfile.id),
      accounts: (accountsResp?.results ?? []).filter(a => a.profile === coreProfile.id),
      wealthSources: (wealthResp?.results ?? []).filter(w => w.profile === coreProfile.id),
      documents: (documentsResp?.results ?? []).filter(d => d.task === taskId),
    });
  }, [coreProfile, addressesResp, accountsResp, wealthResp, documentsResp, taskId]);

  const isMakerActive
    = currentStage?.status === 'Active' && currentStage.stage_type === 'Maker';

  /* ---- Handlers ---- */
  const notify = (severity: 'success' | 'error', message: string) =>
    setSnackbar({ open: true, severity, message });

  const handleStart = async () => {
    if (!taskId || selectedDefinitionId === '') return;
    try {
      await startWorkflow({
        task_id: taskId,
        workflow_definition_id: selectedDefinitionId,
      }).unwrap();
      notify('success', 'Workflow started.');
    }
    catch {
      notify('error', 'Failed to start the workflow.');
    }
  };

  const handleAdvance = async (decision: 'approve' | 'reject') => {
    if (!instance?.id) return;
    try {
      await advanceWorkflow({ instanceId: instance.id, decision, remarks }).unwrap();
      setRemarks('');
      notify(
        'success',
        decision === 'approve'
          ? 'Stage approved.'
          : 'Stage rejected — workflow marked as failed.',
      );
    }
    catch {
      notify('error', `Failed to ${decision} the current stage.`);
    }
  };

  // Maker submits the captured KYC review details. Persist them to the real
  // domain resources (CoreProfile → addresses/accounts/wealth → document
  // uploads) and then advance (approve) to hand off to the Checker.
  const handleMakerSubmit = async (
    payload: IKycFormValues,
    makerRemarks: string,
  ) => {
    if (!instance?.id || !taskId) return;
    if (org == null) {
      notify('error', 'Could not resolve the task organisation. Please retry.');
      return;
    }

    setPersisting(true);
    try {
      // 1. CoreProfile (one per task) — returns the profile id for children.
      const profile = await createCoreProfile(
        toCoreProfileCreate(payload.profile, org, taskId),
      ).unwrap();
      const profileId = profile.id;
      if (profileId == null) throw new Error('CoreProfile created without an id');

      // 2. Child rows (addresses / accounts / sources of wealth).
      await Promise.all([
        ...payload.addresses.map(a =>
          createCustomerAddress(toCustomerAddressCreate(a, org, profileId)).unwrap()),
        ...payload.accounts.map(a =>
          createCusAccount(toCusAccountCreate(a, org, profileId)).unwrap()),
        ...payload.wealthSources.map(w =>
          createSourceOfWealth(toSourceOfWealthCreate(w, org, profileId)).unwrap()),
      ]);

      // 3. Document uploads (multipart, one TaskDocument per file).
      await Promise.all(
        payload.documents
          .filter(d => d.file)
          .map(d =>
            uploadTaskDocument({
              org,
              task: taskId,
              doc_type: d.doc_type,
              title: d.title || undefined,
              remarks: d.remarks || undefined,
              file: d.file!,
            }).unwrap()),
      );

      // 4. Advance the Maker stage to the Checker.
      await advanceWorkflow({
        instanceId: instance.id,
        decision: 'approve',
        remarks: makerRemarks,
      }).unwrap();

      notify('success', 'KYC review details saved and submitted to the checker.');
    }
    catch {
      notify(
        'error',
        'Failed to save the KYC review details. Some records may have been '
        + 'partially saved — please review before resubmitting.',
      );
    }
    finally {
      setPersisting(false);
    }
  };

  const handleRollback = async () => {
    if (!instance?.id || rollbackTargetId === '') return;
    try {
      await rollbackWorkflow({
        instanceId: instance.id,
        stage_instance_id: rollbackTargetId,
        remarks,
      }).unwrap();
      setRemarks('');
      setRollbackTargetId('');
      notify('success', 'Stage sent back for rework.');
    }
    catch {
      notify('error', 'Failed to send the stage back for rework.');
    }
  };

  const handleCancel = async () => {
    if (!instance?.id) return;
    try {
      await cancelWorkflow({ instanceId: instance.id, remarks }).unwrap();
      setRemarks('');
      notify('success', 'Workflow cancelled.');
    }
    catch {
      notify('error', 'Failed to cancel the workflow.');
    }
  };

  /* ---- Render ---- */
  return (
    <Paper sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">KYC Review Workflow</Typography>
        {instance && (
          <Chip
            label={instance.status}
            color={WORKFLOW_STATUS_COLOR[instance.status]}
            variant="filled"
          />
        )}
      </Stack>

      {taskId && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Task:
          {' '}
          <strong>{taskId}</strong>
          {instance && (
            <>
              {' · '}
              {instance.workflow_name}
            </>
          )}
        </Typography>
      )}

      {/* No task selected */}
      {!taskId && (
        <Alert severity="info">
          No task selected. Open this page for a specific task, e.g.
          {' '}
          <code>/kyc-review?task=KYC-...</code>
          .
        </Alert>
      )}

      {/* Loading */}
      {taskId && instancesLoading && (
        <Stack alignItems="center" sx={{ py: 6 }}>
          <CircularProgress />
        </Stack>
      )}

      {/* No workflow yet → start panel */}
      {taskId && !instancesLoading && !instance && (
        <Stack spacing={2} sx={{ maxWidth: 480 }}>
          <Alert severity="info">
            No workflow has been started for this task yet.
          </Alert>
          <TextField
            select
            label="Workflow definition"
            value={selectedDefinitionId}
            onChange={e => setSelectedDefinitionId(Number(e.target.value))}
            fullWidth
          >
            {(definitionsResp?.results ?? []).map(def => (
              <MenuItem key={def.id} value={def.id}>
                {def.name}
                {' '}
                (v
                {def.version}
                )
              </MenuItem>
            ))}
          </TextField>
          <Box>
            <Button
              variant="contained"
              onClick={() => void handleStart()}
              disabled={selectedDefinitionId === '' || starting}
            >
              {starting ? 'Starting…' : 'Start Workflow'}
            </Button>
          </Box>
        </Stack>
      )}

      {/* Active / completed workflow */}
      {instance && (
        <>
          {/* Stage stepper */}
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
            {stages.map((stage) => {
              const completed
                = stage.status === 'Approved' || stage.status === 'Skipped';
              const error
                = stage.status === 'Rejected' || stage.status === 'Timed Out';
              return (
                <Step key={stage.id} completed={completed}>
                  <StepLabel
                    error={error}
                    optional={(
                      <Typography variant="caption" color="text.secondary">
                        {stage.stage_type}
                        {' · '}
                        {stage.status}
                      </Typography>
                    )}
                  >
                    {stage.stage_name}
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>

          {/* Current stage detail */}
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {currentStage
                ? `Current stage: ${currentStage.stage_name}`
                : 'Workflow finished'}
            </Typography>
            <Divider sx={{ mb: 1.5 }} />

            {currentStage
              ? (
                  <Stack
                    direction="row"
                    spacing={4}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ mb: 1 }}
                  >
                    <Detail label="Type" value={currentStage.stage_type} />
                    <Detail
                      label="Status"
                      value={(
                        <Chip
                          size="small"
                          label={currentStage.status}
                          color={STAGE_STATUS_COLOR[currentStage.status]}
                        />
                      )}
                    />
                    <Detail label="Started" value={fmtDate(currentStage.started_at)} />
                    <Detail
                      label="Order"
                      value={`#${currentStage.stage_order}`}
                    />
                  </Stack>
                )
              : (
                  <Alert
                    severity={
                      instance.status === 'Completed'
                        ? 'success'
                        : instance.status === 'Failed'
                          ? 'error'
                          : 'info'
                    }
                  >
                    {`This workflow is ${instance.status.toLowerCase()}.`}
                  </Alert>
                )}
          </Paper>

          {/* Maker stage → capture KYC review details across sub-steps */}
          {!isTerminal && isMakerActive && (
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Maker — Capture KYC Review Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <MakerStageForm
                initialValues={domainData}
                countries={countries}
                segments={segments}
                submitting={busy}
                onSubmit={handleMakerSubmit}
              />
              <Divider sx={{ my: 2 }} />
              <Button
                variant="text"
                color="error"
                onClick={() => void handleCancel()}
                disabled={busy}
              >
                Cancel Workflow
              </Button>
            </Paper>
          )}

          {/* Checker / approval stages → review Maker's data + decide */}
          {!isTerminal && !isMakerActive && (
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              {domainData && (
                <>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    KYC Review Details (captured by Maker)
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <ReviewStep values={domainData} countries={countries} segments={segments} />
                  <Divider sx={{ my: 2 }} />
                </>
              )}

              <Typography variant="subtitle2" gutterBottom>
                Actions
              </Typography>

              <TextField
                label="Remarks"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                fullWidth
                multiline
                minRows={2}
                sx={{ mb: 2 }}
              />

              <Stack
                direction="row"
                spacing={1.5}
                flexWrap="wrap"
                useFlexGap
                alignItems="center"
              >
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => void handleAdvance('approve')}
                  disabled={!canDecide || busy}
                >
                  Approve
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => void handleAdvance('reject')}
                  disabled={!canDecide || busy}
                >
                  Reject
                </Button>

                <Box sx={{ flexGrow: 1 }} />

                <TextField
                  select
                  size="small"
                  label="Rework stage"
                  value={rollbackTargetId}
                  onChange={e => setRollbackTargetId(Number(e.target.value))}
                  sx={{ minWidth: 200 }}
                  disabled={reworkableStages.length === 0 || busy}
                >
                  {reworkableStages.map(s => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.stage_name}
                      {' '}
                      (
                      {s.status}
                      )
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="outlined"
                  onClick={() => void handleRollback()}
                  disabled={rollbackTargetId === '' || busy}
                >
                  Send Back
                </Button>

                <Button
                  variant="text"
                  color="error"
                  onClick={() => void handleCancel()}
                  disabled={busy}
                >
                  Cancel Workflow
                </Button>
              </Stack>

              {!canDecide && currentStage && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  The current stage is not awaiting a decision (status:
                  {' '}
                  {currentStage.status}
                  ).
                </Alert>
              )}
            </Paper>
          )}

          {/* Audit trail */}
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            Audit Trail
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>When</TableCell>
                  <TableCell>From</TableCell>
                  <TableCell>To</TableCell>
                  <TableCell>By</TableCell>
                  <TableCell>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(logs ?? []).map(log => (
                  <TableRow key={log.id}>
                    <TableCell>{fmtDate(log.timestamp)}</TableCell>
                    <TableCell>{log.from_status}</TableCell>
                    <TableCell>{log.to_status}</TableCell>
                    <TableCell>{log.transitioned_by_name ?? '—'}</TableCell>
                    <TableCell>{log.remarks ?? '—'}</TableCell>
                  </TableRow>
                ))}
                {(!logs || logs.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No transitions recorded yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

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
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/*  Small read-only detail field                                       */
/* ------------------------------------------------------------------ */
function Detail({ label, value }: { label: string, value: ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" component="div">
        {value}
      </Typography>
    </Box>
  );
}
