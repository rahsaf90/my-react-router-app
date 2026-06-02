import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Alert,
  Box,
  Button,
  Grid,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  useFieldArray,
  type Control,
  type FieldArrayPath,
  type UseFormSetValue,
} from 'react-hook-form';
import type { IFrmSubSect } from '~/lib/types/conf';
import type { ICountry, IKycFormValues, ISegment } from '~/lib/types/kyc';
import DynamicField from './DynamicField';
import {
  arrayBucketForSubSect,
  isMultiRow,
  profileFieldPath,
  ROW_DEFAULTS,
  rowFieldPath,
  visibleFields,
  type KycArrayBucket,
} from './dynamicForm';

interface DynamicSubSectionProps {
  sub: IFrmSubSect
  control: Control<IKycFormValues>
  setValue: UseFormSetValue<IKycFormValues>
  countries: ICountry[]
  segments: ISegment[]
}

export default function DynamicSubSection({
  sub,
  control,
  setValue,
  countries,
  segments,
}: DynamicSubSectionProps) {
  const fields = visibleFields(sub);
  const bucket = arrayBucketForSubSect(sub);

  if (isMultiRow(sub) && bucket) {
    return (
      <MultiRowSubSection
        sub={sub}
        bucket={bucket}
        control={control}
        setValue={setValue}
        countries={countries}
        segments={segments}
      />
    );
  }

  /* ---- Single (profile) field grid ---- */
  return (
    <Stack spacing={1.5}>
      {sub.name && (
        <Typography variant="subtitle2" color="text.secondary">{sub.name}</Typography>
      )}
      <Grid container spacing={2}>
        {fields.map((field) => {
          const col = Math.min(Math.max(field.col_size || 3, 1), 12);
          return (
            <Grid key={field.id} size={{ xs: 12, sm: col >= 12 ? 12 : 6, md: col }}>
              <DynamicField
                field={field}
                name={profileFieldPath(field)}
                control={control}
                setValue={setValue}
                countries={countries}
                segments={segments}
              />
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  Multi-row sub-section (repeatable table)                           */
/* ------------------------------------------------------------------ */
interface MultiRowSubSectionProps extends DynamicSubSectionProps {
  bucket: KycArrayBucket
}

function MultiRowSubSection({
  sub,
  bucket,
  control,
  setValue,
  countries,
  segments,
}: MultiRowSubSectionProps) {
  const fields = visibleFields(sub);
  const { fields: rows, append, remove } = useFieldArray({
    control,
    name: bucket as FieldArrayPath<IKycFormValues>,
  });

  return (
    <Stack spacing={1.5}>
      {sub.name && (
        <Typography variant="subtitle2" color="text.secondary">{sub.name}</Typography>
      )}

      {rows.length === 0 && (
        <Alert severity="info">No rows added yet. Use “Add row” to begin.</Alert>
      )}

      {rows.length > 0 && (
        <TableContainer component={Box} sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {fields.map(field => (
                  <TableCell key={field.id}>{field.name}</TableCell>
                ))}
                <TableCell padding="checkbox" />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={row.id}>
                  {fields.map(field => (
                    <TableCell key={field.id} sx={{ minWidth: 150, verticalAlign: 'top' }}>
                      <DynamicField
                        field={field}
                        name={rowFieldPath(bucket, index, field)}
                        fileNamePath={
                          bucket === 'documents'
                            ? `documents.${index}.fileName`
                            : undefined
                        }
                        control={control}
                        setValue={setValue}
                        countries={countries}
                        segments={segments}
                        size="small"
                        dense
                      />
                    </TableCell>
                  ))}
                  <TableCell padding="checkbox" sx={{ verticalAlign: 'top' }}>
                    <Tooltip title="Remove row">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => remove(index)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => append(ROW_DEFAULTS[bucket]() as never)}
        >
          Add row
        </Button>
      </Box>
    </Stack>
  );
}
