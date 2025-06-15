import { Form, Formik } from 'formik';
import { useState } from 'react';
import * as yup from 'yup';

// material imports

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Snackbar, { type SnackbarCloseReason } from '@mui/material/Snackbar';

// import app components
import AppIcon from '~/components/ui/AppIcon';
import { FormTextField } from '~/components/ui/FormFields';
import { loginUser } from '~/lib/store/features/authSlice';
import { useAppDispatch } from '~/lib/store/hooks';
import type { IUserAuth } from '~/lib/types/common';

// my libs

const validationSchema = yup.object({
  username: yup
    .string()
    .label('Invalid username / Email')
    .required('Username is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export default function LoginForm() {
  const dispatch = useAppDispatch();

  const [snack, setSnack] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });
  const [showPassword, setShowPassword] = useState(false);
  const handleSnackClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnack({ ...snack, open: false });
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  return (
    <>
      <Snackbar
        open={snack.open}
        autoHideDuration={6000}
        onClose={handleSnackClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >

        <Alert
          onClose={handleSnackClose}
          severity={snack.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
      <Formik
        initialValues={{ username: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={(values: IUserAuth, { setSubmitting }) => {
          console.log('Form submitted:', values);

          dispatch(loginUser(values)).unwrap().then(() => {
            // Handle successful login
            setSnack({
              open: true,
              message: 'Login successful',
              severity: 'success',
            });
            window.location.replace('/'); // Redirect to dashboard or home page
          }).catch((error) => {
            // Handle login error
            console.error('Login error:', error);
            setSnack({
              open: true,
              message: 'Login failed',
              severity: 'error',
            });
          }).finally(() => {
            setSubmitting(false);
          });
        }}
      >

        { // render block
          ({ isSubmitting, isValid }) => (
            <Form>
              <FormTextField
                sx={{ marginTop: 2 }}
                name="username"
                label="Username or Email"
                type="username"
                fullWidth
                required
                autoComplete="username"
                margin="normal"
                variant="outlined"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <AppIcon icon="email" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <FormTextField
                sx={{ marginTop: 2 }}
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                autoComplete="current-password"
                margin="normal"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleShowPassword}
                          edge="end"
                        >
                          <AppIcon
                            icon={
                              showPassword
                                ? 'visibility'
                                : 'visibility-off'
                            }
                          />
                        </IconButton>
                      </InputAdornment>
                    ) },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isSubmitting || !isValid}
                loading={isSubmitting}
                loadingPosition="start"
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </Form>
          )
        }

      </Formik>
    </>

  );
}
