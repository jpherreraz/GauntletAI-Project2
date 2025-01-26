import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  CircularProgress,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@crm/shared/constants';
import { useFAQs } from '../../hooks/useFAQs';

const FAQ: React.FC = () => {
  const navigate = useNavigate();
  const { data: faqs, isLoading } = useFAQs();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Frequently Asked Questions
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        {faqs?.map((faq) => (
          <Accordion key={faq.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}

        {(!faqs || faqs.length === 0) && (
          <Typography color="text.secondary" align="center">
            No FAQs available at the moment.
          </Typography>
        )}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate(ROUTES.TICKETS + '/new')}
        >
          Contact Support
        </Button>
      </Box>
    </Box>
  );
};

export default FAQ; 