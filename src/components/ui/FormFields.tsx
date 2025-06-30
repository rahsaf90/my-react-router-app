import { FormControl, InputLabel } from '@mui/material';
import Select, { type SelectProps } from '@mui/material/Select';
import type {
  FilledTextFieldProps,
  OutlinedTextFieldProps,
  StandardTextFieldProps,
  TextFieldVariants,
} from '@mui/material/TextField';
import TextField from '@mui/material/TextField';

import React from 'react';
import { useController, type FieldValues, type UseControllerProps } from 'react-hook-form';

export function FormTextField<T extends FieldValues>(
  props: UseControllerProps<T> & React.JSX.IntrinsicAttributes
    & { variant?: TextFieldVariants }
    & Omit<StandardTextFieldProps | OutlinedTextFieldProps | FilledTextFieldProps, 'variiant'>,
) {
  const { control, ...otherProps } = props;
  const { field, fieldState: meta } = useController({
    control, name: props.name,
  });

  return (
    <TextField
      {...field}
      {...otherProps}
      onChange={field.onChange} // Send value to hook form
      onBlur={field.onBlur} // Notify when input is touched/blur
      value={field.value} // Input value
      name={field.name} // Send down the input name
      inputRef={field.ref} // Send input ref, so we can focus on input when error appears
      error={meta.invalid} // Indicate error state based on validation
      helperText={meta.invalid && meta.error?.message} // Display helper text for errors

    />
  );
};

export function FormSelectField<T extends FieldValues>(
  props: UseControllerProps<T> & React.JSX.IntrinsicAttributes & SelectProps,
) {
  const { control, ...otherProps } = props;
  const { field, fieldState: meta } = useController({
    control, name: props.name ?? 'select',
  });
  return (
    <FormControl fullWidth>
      <InputLabel>{props.label}</InputLabel>
      <Select
        {...field}
        {...otherProps}
        onChange={field.onChange} // Send value to hook form
        onBlur={field.onBlur} // Notify when input is touched/blur
        value={field.value} // Input value
        name={field.name} // Send down the input name
        inputRef={field.ref} // Send input ref, so we can focus on input when error appears
        error={meta.invalid} // Indicate error state based on validation
        // helperText={meta.invalid && meta.error?.message} // Display helper text for errors
      />
    </FormControl>
  );
};
