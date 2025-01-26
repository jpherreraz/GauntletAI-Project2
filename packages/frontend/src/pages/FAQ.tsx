import React from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Container,
  Paper,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ContactSupport as ContactSupportIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@crm/shared/constants';

const faqs = [
  {
    question: "How do I submit a support ticket?",
    answer: "Click the 'Contact Support' button above or navigate to the Tickets page from the sidebar. Then click 'New Ticket', enter a title and description for your issue, and submit the form.",
  },
  {
    question: "How long will it take to get a response?",
    answer: "Our support team typically responds within 24-48 hours. Once your ticket is assigned to a support representative, you'll be able to communicate with them directly through the ticket.",
  },
  {
    question: "How can I check the status of my ticket?",
    answer: "Go to the Tickets page in the sidebar to view all your tickets. Each ticket will show its current status: Pending (waiting for assignment), In Progress (being worked on), or Resolved.",
  },
  {
    question: "Can I update my ticket after submitting it?",
    answer: "Yes, you can add additional information by clicking on your ticket and adding a comment to the conversation. This helps our support team better understand and resolve your issue.",
  },
  {
    question: "What should I do if my issue is urgent?",
    answer: "Submit a ticket with a clear description of the urgency. While all tickets start as 'Pending', our team prioritizes tickets based on their content and impact.",
  },
];

const FAQPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          How can we help you?
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          Find answers to common questions below or create a support ticket
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<ContactSupportIcon />}
          onClick={() => navigate(ROUTES.TICKETS + '/new')}
          sx={{ minWidth: 200 }}
        >
          Contact Support
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 3 }}>
        {faqs.map((faq, index) => (
          <Accordion key={index} elevation={0}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ '&:hover': { bgcolor: 'action.hover' } }}
            >
              <Typography variant="h6">{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
    </Container>
  );
};

export default FAQPage; 