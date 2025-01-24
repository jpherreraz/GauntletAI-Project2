import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useCreateTicket } from '../../hooks/useTickets';
import { ROUTES } from '@crm/shared/constants';
import { TicketPriority, TicketStatus } from '@crm/shared/types/ticket';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '@crm/shared/utils/api-client';

interface FormValues {
  title: string;
  description: string;
  priority: typeof TicketPriority[keyof typeof TicketPriority];
  category: string;
}

const validationSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  priority: yup.string().oneOf(Object.values(TicketPriority)).required('Priority is required'),
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
      priority: TicketPriority.LOW,
      category: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (!user?.id) {
          setError('User not authenticated');
          return;
        }

        // Log user ID
        console.log('Current user ID:', user.id);
        
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select()
          .eq('id', user.id)
          .single();

        console.log('Profile check result:', { profile, profileError });

        if (!profile) {
          console.log('Creating profile for user...');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{ 
              id: user.id, 
              firstName: '', 
              lastName: '', 
              role: 'customer' 
            }])
            .select()
            .single();
          
          console.log('Profile creation result:', { newProfile, createError });
          
          if (createError) {
            console.error('Profile creation error:', createError);
            setError('Failed to create user profile');
            return;
          }
        }
        
        const ticketData = {
          ...values,
          status: TicketStatus.OPEN,
          customerId: user.id,
          dueDate: null,
          tags: [],
        };
        
        console.log('Creating ticket with data:', ticketData);
        const result = await createTicket.mutateAsync(ticketData);
        console.log('Ticket created:', result);

        navigate(ROUTES.TICKETS);
      } catch (err) {
        console.error('Failed to create ticket:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else if (typeof err === 'object' && err !== null) {
          console.error('Detailed error:', JSON.stringify(err, null, 2));
          setError('Failed to create ticket. Check console for details.');
        } else {
          setError('Failed to create ticket');
        }
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

            <Grid item xs={12} md={6}>
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
                  <MenuItem value={TicketPriority.LOW}>Low</MenuItem>
                  <MenuItem value={TicketPriority.MEDIUM}>Medium</MenuItem>
                  <MenuItem value={TicketPriority.HIGH}>High</MenuItem>
                  <MenuItem value={TicketPriority.URGENT}>Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
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