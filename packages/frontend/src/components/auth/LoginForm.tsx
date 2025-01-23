import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@crm/shared/utils/api-client';
import { ROUTES } from '@crm/shared/constants';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password should be of minimum 8 characters length')
    .required('Password is required'),
});

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (signInError) throw signInError;

        navigate(ROUTES.DASHBOARD);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    },
  });

  return (
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxWidth: 400,
        mx: 'auto',
        p: 3,
      }}
    >
      <Typography variant="h5" component="h1" gutterBottom>
        Sign In
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        id="email"
        name="email"
        label="Email"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
      />

      <TextField
        fullWidth
        id="password"
        name="password"
        label="Password"
        type="password"
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
      />

      <Button
        color="primary"
        variant="contained"
        fullWidth
        type="submit"
        disabled={formik.isSubmitting}
      >
        Sign In
      </Button>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Link href={ROUTES.REGISTER} variant="body2">
          Don't have an account? Sign Up
        </Link>
      </Box>
    </Box>
  );
}; 