import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
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

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isValid },
    setError,
  } = useForm<IUserAuth>({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
    },
  });

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

  const onSubmit = async (values: IUserAuth) => {
    try {
      await dispatch(loginUser(values)).unwrap();
      setSnack({
        open: true,
        message: 'Login successful',
        severity: 'success',
      });
      window.location.replace('/');
    }
    catch {
      setSnack({
        open: true,
        message: 'Login failed',
        severity: 'error',
      });
      setError('username', { message: ' ' });
      setError('password', { message: ' ' });
    }
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
      <form
        onSubmit={event =>
          void handleSubmit(onSubmit)(event)}
        noValidate
      >
        <FormTextField<IUserAuth>
          sx={{ marginTop: 2 }}
          name="username"
          label="Username or Email"
          type="username"
          fullWidth
          required
          autoComplete="username"
          margin="normal"
          variant="outlined"

          control={control}

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

        <FormTextField<IUserAuth>
          name="password"
          sx={{ marginTop: 2 }}
          label="Password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          required
          autoComplete="current-password"
          margin="normal"

          control={control}

          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleShowPassword}
                    edge="end"
                    tabIndex={-1}
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
              ),
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isSubmitting || !isValid}
          sx={{ mt: 2 }}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </>
  );
}
