import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useCreateTicket } from '../../hooks/useTickets';
import { ROUTES } from '@crm/shared/constants';
import { TicketStatus } from '@crm/shared/types/ticket';
import { useAuth } from '../../contexts/AuthContext';

interface FormValues {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
}

const validationSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  priority: yup.string().oneOf(['low', 'medium', 'high', 'urgent']).required('Priority is required'),
  category: yup.string().required('Category is required'),
});

const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const createTicket = useCreateTicket();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik<FormValues>({
    initialValues: {
      title: '',
      description: '',
      priority: 'medium',
      category: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (!user?.id) {
          setError('User not authenticated');
          return;
        }

        const ticketData = {
          title: values.title,
          description: values.description,
          priority: values.priority,
          category: values.category,
          customer_id: user.id,
        };
        
        await createTicket.mutateAsync(ticketData);
        navigate(ROUTES.TICKETS);
      } catch (err) {
        console.error('Failed to create ticket:', err);
        setError('Failed to create ticket. Please try again.');
      }
    },
  });

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button onClick={() => navigate(ROUTES.TICKETS)}>Back to Tickets</Button>
        <Typography variant="h4">Create New Ticket</Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                id="description"
                name="description"
                label="Description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  id="priority"
                  name="priority"
                  value={formik.values.priority}
                  label="Priority"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.priority && Boolean(formik.errors.priority)}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="category"
                name="category"
                label="Category"
                value={formik.values.category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.category && Boolean(formik.errors.category)}
                helperText={formik.touched.category && formik.errors.category}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(ROUTES.TICKETS)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={formik.isSubmitting || !formik.isValid}
                >
                  {formik.isSubmitting ? 'Creating...' : 'Create Ticket'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateTicket; 