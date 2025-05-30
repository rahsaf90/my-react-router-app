import * as yup from 'yup';
import { Form, Formik } from 'formik';
import { useState } from 'react';

// material imports

import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Snackbar, { type SnackbarCloseReason } from '@mui/material/Snackbar';

// import app components
import { FormTextField } from '~/components/ui/FormFields';
import AppIcon from '~/components/ui/AppIcon';

// my libs

const validationSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export default function LoginForm() {
  const [snack, setSnack] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });
  const [showPassword, setShowPassword] = useState(false);
  const handleSnackClose = (event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
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
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >

        <Alert onClose={handleSnackClose} severity={snack.severity} variant="filled" sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          console.log('Form submitted:', values);
          // Here you would typically handle the login logic, e.g., API call
          // For demonstration, we'll just simulate a successful login
          // Simulate an API call
          setTimeout(() => {
            setSnack({
              open: true,
              message: 'Login successful',
              severity: 'success',
            });
            setSubmitting(false);
          }, 1000);
        }}
      >

        {
          ({ isSubmitting, isValid }) => (
            <Form>
              <FormTextField
                sx={{ marginTop: 2 }}
                name="email"
                label="Email"
                type="email"
                fullWidth
                required
                autoComplete="email"
                margin="normal"
                variant="outlined"
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end"><AppIcon icon="email" /></InputAdornment>,
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
                          <AppIcon icon={showPassword ? 'visibility' : 'visibility-off'} />
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
