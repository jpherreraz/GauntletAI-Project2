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
    question: "How do I track my order?",
    answer: "You can track your order by logging into your account and visiting the Orders section. There you will find real-time updates on your order status.",
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy for most items. Items must be unused and in their original packaging. Contact our support team to initiate a return.",
  },
  {
    question: "How can I change my account information?",
    answer: "You can update your account information by going to your Profile settings. There you can modify your personal details, email, and password.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers.",
  },
  {
    question: "How long does shipping take?",
    answer: "Standard shipping typically takes 3-5 business days. Express shipping options are available at checkout for faster delivery.",
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
          Find answers to common questions below or contact our support team
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