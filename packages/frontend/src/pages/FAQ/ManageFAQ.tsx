import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useFAQs, useCreateFAQ, useUpdateFAQ, useDeleteFAQ } from '../../hooks/useFAQs';
import { FAQ } from '@crm/shared/types/faq';

interface FAQFormData {
  question: string;
  answer: string;
}

const ManageFAQ: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState<FAQFormData>({ question: '', answer: '' });

  const { data: faqs, isLoading } = useFAQs();
  const createFAQ = useCreateFAQ();
  const updateFAQ = useUpdateFAQ();
  const deleteFAQ = useDeleteFAQ();

  const handleOpen = (faq?: FAQ) => {
    if (faq) {
      setEditingFAQ(faq);
      setFormData({ question: faq.question, answer: faq.answer });
    } else {
      setEditingFAQ(null);
      setFormData({ question: '', answer: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingFAQ(null);
    setFormData({ question: '', answer: '' });
  };

  const handleSubmit = async () => {
    try {
      if (editingFAQ) {
        await updateFAQ.mutateAsync({ id: editingFAQ.id, ...formData });
      } else {
        await createFAQ.mutateAsync(formData);
      }
      handleClose();
    } catch (error) {
      console.error('Failed to save FAQ:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFAQ.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
    }
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Manage FAQs</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add FAQ
        </Button>
      </Box>

      <Paper>
        <List>
          {faqs?.map((faq) => (
            <ListItem key={faq.id} divider>
              <ListItemText
                primary={faq.question}
                secondary={faq.answer}
                secondaryTypographyProps={{ 
                  sx: { 
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '500px'
                  } 
                }}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleOpen(faq)} sx={{ mr: 1 }}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDelete(faq.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingFAQ ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Question"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            />
            <TextField
              fullWidth
              label="Answer"
              multiline
              rows={4}
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingFAQ ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageFAQ; 