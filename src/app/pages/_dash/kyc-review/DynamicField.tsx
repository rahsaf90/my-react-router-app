import UploadFileIcon from '@mui/icons-material/UploadFile';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import Button from '@mui/material/Button';
import {
  Controller,
  useController,
  type Control,
  type Path,
  type UseFormSetValue,
} from 'react-hook-form';
import { FormSelectField, FormTextField } from '~/components/ui/FormFields';
import type { IFrmField } from '~/lib/types/conf';
import type { ICountry, IKycFormValues, ISegment } from '~/lib/types/kyc';
import {
  fieldOptions,
  isFieldRequired,
  isUploadField,
  type ReferenceOptionCache,
} from './dynamicForm';

interface DynamicFieldProps {
  field: IFrmField
  /** RHF path, e.g. `profile.name` or `accounts.0.acc_num`. */
  name: string
  control: Control<IKycFormValues>
  setValue: UseFormSetValue<IKycFormValues>
  countries: ICountry[]
  segments: ISegment[]
  optionCache?: ReferenceOptionCache
  /** Sibling path that mirrors the chosen file name (upload fields only). */
  fileNamePath?: string
  size?: 'small' | 'medium'
  dense?: boolean
}

/**
 * Renders a single template field by `field_type`/`rules`, bound to the given
 * react-hook-form path. The produced value shape matches IKycFormValues so the
 * existing schema, mappers and domain persistence are unchanged.
 */
export default function DynamicField({
  field,
  name,
  control,
  setValue,
  countries,
  segments,
  optionCache,
  fileNamePath,
  size = 'medium',
  dense = false,
}: DynamicFieldProps) {
  const path = name as Path<IKycFormValues>;
  const required = isFieldRequired(field);
  const help = field.rules?.help;
  const maxLength = field.rules?.maxlength;

  /* ---- File upload (TaskDocument binary) ---- */
  if (isUploadField(field)) {
    return (
      <UploadField
        field={field}
        name={path}
        control={control}
        setValue={setValue}
        fileNamePath={fileNamePath}
      />
    );
  }

  /* ---- Checkbox ---- */
  if (field.field_type === 'checkbox') {
    return (
      <Controller
        control={control}
        name={path}
        render={({ field: f }) => (
          <FormControlLabel
            control={(
              <Checkbox
                checked={!!f.value}
                onChange={e => f.onChange(e.target.checked)}
                onBlur={f.onBlur}
                size={size}
              />
            )}
            label={field.name}
          />
        )}
      />
    );
  }

  /* ---- Select / multiselect ---- */
  if (field.field_type === 'select' || field.field_type === 'multiselect') {
    const options = fieldOptions(field, countries, segments, optionCache);
    const multiple = field.field_type === 'multiselect';
    return (
      <Stack spacing={0.25}>
        <FormSelectField<IKycFormValues>
          control={control}
          name={path}
          label={field.name}
          size={size}
          fullWidth
          multiple={multiple}
          required={required}
        >
          {!required && !multiple && (
            <MenuItem value=""><em>None</em></MenuItem>
          )}
          {options.map(o => (
            <MenuItem key={String(o.value)} value={o.value}>{o.label}</MenuItem>
          ))}
        </FormSelectField>
        {help && !dense && (
          <Typography variant="caption" color="text.secondary">{help}</Typography>
        )}
      </Stack>
    );
  }

  /* ---- Text / number / date / textarea ---- */
  const isTextArea = field.field_type === 'textarea';
  const type
    = field.field_type === 'number'
      ? 'number'
      : field.field_type === 'date'
        ? 'date'
        : 'text';

  return (
    <Stack spacing={0.25}>
      <FormTextField<IKycFormValues>
        control={control}
        name={path}
        label={dense ? undefined : field.name}
        placeholder={dense ? field.name : undefined}
        type={isTextArea ? undefined : type}
        multiline={isTextArea}
        minRows={isTextArea ? 2 : undefined}
        required={required}
        size={size}
        fullWidth
        slotProps={{
          inputLabel: type === 'date' ? { shrink: true } : undefined,
          htmlInput: maxLength ? { maxLength } : undefined,
        }}
      />
      {help && !dense && (
        <Typography variant="caption" color="text.secondary">{help}</Typography>
      )}
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  File upload field                                                  */
/* ------------------------------------------------------------------ */
interface UploadFieldProps {
  field: IFrmField
  name: Path<IKycFormValues>
  control: Control<IKycFormValues>
  setValue: UseFormSetValue<IKycFormValues>
  fileNamePath?: string
}

function UploadField({ field, name, control, setValue, fileNamePath }: UploadFieldProps) {
  const { field: f, fieldState } = useController({ control, name });
  const file = f.value as File | null;
  const fileName = file?.name;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    f.onChange(selected);
    if (fileNamePath) {
      setValue(
        fileNamePath as Path<IKycFormValues>,
        (selected?.name ?? '') as never,
        { shouldValidate: true, shouldDirty: true },
      );
    }
  };

  return (
    <FormControl error={fieldState.invalid} fullWidth>
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          component="label"
          variant="outlined"
          size="small"
          startIcon={<UploadFileIcon />}
        >
          {fileName ? 'Replace file' : (field.name || 'Upload file')}
          <input
            type="file"
            hidden
            onChange={handleChange}
            onBlur={f.onBlur}
          />
        </Button>
        <Typography variant="body2" color="text.secondary" noWrap>
          {fileName ?? 'No file selected'}
        </Typography>
      </Stack>
      {fieldState.invalid && (
        <FormHelperText>{fieldState.error?.message}</FormHelperText>
      )}
    </FormControl>
  );
}
