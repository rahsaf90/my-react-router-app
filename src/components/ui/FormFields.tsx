import Select, { type SelectProps } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import type {
  FilledTextFieldProps,
  OutlinedTextFieldProps,
  StandardTextFieldProps,
  TextFieldVariants } from '@mui/material/TextField';

import { useField } from 'formik';
import React from 'react';

export const FormTextField = (
  props: React.JSX.IntrinsicAttributes
    & { variant?: TextFieldVariants }
    & Omit<StandardTextFieldProps | OutlinedTextFieldProps | FilledTextFieldProps, 'variiant'>,
) => {
  const [field, meta] = useField(props);
  const error = Boolean(meta.touched && meta.error);

  return (
    <TextField
      {...field}
      {...props}
      error={error}
      helperText={error ? meta.error : ''}

    />
  );
};

export const FormSelectField = (
  props: React.JSX.IntrinsicAttributes
    & SelectProps) => {
  const [field, meta] = useField(props);
  const error = Boolean(meta.touched && meta.error);
  return (
    <Select
      {...field}
      {...props}
      error={error}
    />
  );
};
