import React from 'react';
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

interface FormValues {
  title: string;
  description: string;
  priority: typeof TicketPriority[keyof typeof TicketPriority];
  category: string;
  dueDate: Date | null;
}

const validationSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  priority: yup.string().oneOf(Object.values(TicketPriority)).required('Priority is required'),
  category: yup.string().required('Category is required'),
  dueDate: yup.date().nullable(),
});

const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const createTicket = useCreateTicket();
  const { user } = useAuth();

  const formik = useFormik<FormValues>({
    initialValues: {
      title: '',
      description: '',
      priority: TicketPriority.LOW,
      category: '',
      dueDate: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (!user?.id) return;
        
        await createTicket.mutateAsync({
          ...values,
          status: TicketStatus.OPEN,
          customerId: user.id,
          dueDate: values.dueDate?.toISOString() || null,
          tags: [],
          attachments: [],
        });

        navigate(ROUTES.TICKETS);
      } catch (error) {
        console.error('Failed to create ticket:', error);
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

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="dueDate"
                name="dueDate"
                label="Due Date"
                type="datetime-local"
                value={formik.values.dueDate ? new Date(formik.values.dueDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  formik.setFieldValue('dueDate', date);
                }}
                onBlur={formik.handleBlur}
                error={formik.touched.dueDate && Boolean(formik.errors.dueDate)}
                helperText={formik.touched.dueDate && formik.errors.dueDate}
                InputLabelProps={{
                  shrink: true,
                }}
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