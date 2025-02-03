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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Send as SendIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@crm/shared/constants';
import { useFAQs } from '../../hooks/useFAQs';
import { supabase } from '@crm/shared/utils/api-client';

const FAQ: React.FC = () => {
  const navigate = useNavigate();
  const { data: faqs, isLoading, error } = useFAQs();
  const [chatOpen, setChatOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [chatHistory, setChatHistory] = React.useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [isTyping, setIsTyping] = React.useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const [pendingTicketCreation, setPendingTicketCreation] = React.useState(false);

  console.log('🔍 FAQ: Rendering', {
    isLoading,
    hasFaqs: !!faqs,
    faqCount: faqs?.length,
    error
  });

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessage('');
    setIsTyping(true);

    // Add user message to chat history
    const newHistory: Array<{ role: 'user' | 'assistant', content: string }> = [
      ...chatHistory,
      { role: 'user', content: userMessage }
    ];
    setChatHistory(newHistory);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: userMessage,
          history: newHistory,
          createTicketConfirmed: pendingTicketCreation
        }
      });

      if (error) throw error;

      // Add AI response to chat history
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }]);

      // Reset pending ticket creation
      setPendingTicketCreation(false);

      // If the response includes "would you like me to create a support ticket" or similar
      if (data.response.toLowerCase().includes('would you like') && 
          data.response.toLowerCase().includes('ticket')) {
        setPendingTicketCreation(true);
      }

      // If a ticket was created, show the details
      if (data.ticket) {
        console.log('Ticket created:', data.ticket);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (isLoading) {
    console.log('🔍 FAQ: Loading state');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    console.error('❌ FAQ: Error state:', error);
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error loading FAQs: {error.message}</Typography>
      </Box>
    );
  }

  console.log('✅ FAQ: Rendering content with FAQs:', faqs);

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

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate(ROUTES.TICKETS + '/new')}
        >
          Contact Support
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => setChatOpen(true)}
        >
          Chat with AI Support
        </Button>
      </Box>

      <Dialog
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chat with AI Support</DialogTitle>
        <DialogContent>
          <Box sx={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
              {chatHistory.map((msg, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      maxWidth: '80%',
                      bgcolor: msg.role === 'user' ? 'primary.main' : 'grey.100',
                      color: msg.role === 'user' ? 'white' : 'text.primary',
                    }}
                  >
                    <Typography>{msg.content}</Typography>
                  </Paper>
                </Box>
              ))}
              {isTyping && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <CircularProgress size={20} />
                  </Paper>
                </Box>
              )}
              <div ref={chatEndRef} />
            </Box>
            <Stack direction="row" spacing={1} sx={{ p: 2 }}>
              <TextField
                fullWidth
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isTyping}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={!message.trim() || isTyping}
              >
                <SendIcon />
              </Button>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChatOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FAQ; 