import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import {
    Alert,
    Button,
    Card,
    CardContent,
    Chip,
    IconButton,
    MenuItem,
    Stack,
    Typography,
} from '@mui/material';
import { useRef } from 'react';
import {
    useFieldArray,
    useWatch,
    type Control,
    type FieldErrors,
    type UseFormSetValue,
} from 'react-hook-form';
import { FormSelectField, FormTextField } from '~/components/ui/FormFields';
import type { IKycFormValues } from '~/lib/types/kyc';
import { defaultDocument, DOCUMENT_TYPE_OPTIONS } from './schema';

/* ------------------------------------------------------------------ */
/*  Single document card                                               */
/* ------------------------------------------------------------------ */
interface DocumentCardProps {
  index: number
  control: Control<IKycFormValues>
  setValue: UseFormSetValue<IKycFormValues>
  onRemove: (i: number) => void
}

function DocumentCard({
  index,
  control,
  setValue,
  onRemove,
}: DocumentCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileName = useWatch({ control, name: `documents.${index}.fileName` });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue(`documents.${index}.file`, file, { shouldValidate: true });
      setValue(`documents.${index}.fileName`, file.name, { shouldValidate: true });
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle2">
              Document #
              {index + 1}
            </Typography>
            <IconButton size="small" color="error" onClick={() => onRemove(index)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormSelectField<IKycFormValues>
              control={control}
              name={`documents.${index}.doc_type`}
              label="Document Type"
              size="small"
              fullWidth
            >
              {DOCUMENT_TYPE_OPTIONS.map(o => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </FormSelectField>

            <FormTextField<IKycFormValues>
              control={control}
              name={`documents.${index}.title`}
              label="Title (optional)"
              size="small"
              fullWidth
            />

            <FormTextField<IKycFormValues>
              control={control}
              name={`documents.${index}.remarks`}
              label="Remarks (optional)"
              size="small"
              fullWidth
            />
          </Stack>

          {/* File picker */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileSelect}
            />
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              size="small"
            >
              Choose File
            </Button>

            {fileName
              ? (
                  <Chip
                    icon={<InsertDriveFileIcon />}
                    label={fileName}
                    variant="outlined"
                    size="small"
                  />
                )
              : (
                  <Typography variant="body2" color="text.secondary">
                    No file selected
                  </Typography>
                )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Step component                                                     */
/* ------------------------------------------------------------------ */
interface DocumentUploadStepProps {
  control: Control<IKycFormValues>
  errors: FieldErrors<IKycFormValues>
  setValue: UseFormSetValue<IKycFormValues>
}

export default function DocumentUploadStep({
  control,
  errors,
  setValue,
}: DocumentUploadStepProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'documents',
    keyName: 'rowId',
  });

  const arrayError = errors.documents && !Array.isArray(errors.documents)
    ? errors.documents.message ?? ''
    : '';

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">
          Reference Documents (
          {fields.length}
          )
        </Typography>
        <Button
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          onClick={() => append(defaultDocument)}
        >
          Add Document
        </Button>
      </Stack>

      {arrayError && <Alert severity="error">{arrayError}</Alert>}

      {fields.length === 0 && (
        <Alert severity="info">
          No documents added yet. Click &quot;Add Document&quot; to upload reference documents.
        </Alert>
      )}

      {fields.map((field, index) => (
        <DocumentCard
          key={field.rowId}
          index={index}
          control={control}
          setValue={setValue}
          onRemove={remove}
        />
      ))}
    </Stack>
  );
}
