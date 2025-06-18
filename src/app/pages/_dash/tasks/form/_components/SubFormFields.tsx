import { Grid, MenuItem } from '@mui/material';
import { FormSelectField, FormTextField } from '~/components/ui/FormFields';
import type { IFrmSubSect, IListType } from '~/lib/types/conf';

interface SubFormProps {
  subSection: IFrmSubSect
  listTypes: IListType[]

}

function getOptions(listTypes: IListType[], list_id: number) {
  const list = listTypes.find(type => type.id === list_id);
  if (!list) return [];
  return list.options.map(option => ({
    value: option.value,
    label: option.name,
  }));
}
export default function SubFormForm({ subSection, listTypes }: SubFormProps) {
  return (
    <Grid container spacing={2} sx={{ margin: 1 }}>
      {subSection.fields.map(field => (

        <Grid size={field.col_size ?? 3} key={field.id}>
          {field.field_type === 'text' && (
            <FormTextField
              type={field.field_type}
              name={`${field.model_name}.${field.attr_name}`}
              label={field.name}
              placeholder={field.description}
              required={field.rules?.required ?? false}
              fullWidth
              variant="outlined"

            >
            </FormTextField>
          )}
          {field.field_type === 'textarea' && (
            <FormTextField
              type="text"
              name={`${field.model_name}.${field.attr_name}`}
              label={field.name}
              placeholder={field.description}
              required={field.rules?.required ?? false}
              fullWidth
              variant="outlined"

              multiline
              minRows={3}
            >
            </FormTextField>
          )}
          {field.field_type === 'select' && (
            <FormSelectField
              name={`${field.model_name}.${field.attr_name}`}
              label={field.name}
              required={field.rules?.required ?? false}
              fullWidth
              variant="outlined"
            >

              {getOptions(listTypes, field.list_type ?? 0).map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </FormSelectField>
          )}
        </Grid>

      ))}
    </Grid>
  );
}
