import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import TicketList from './TicketList';
import { TicketDetail } from './TicketDetail';
import CreateTicket from './CreateTicket';

const Tickets: React.FC = () => {
  return (
    <Box sx={{ height: 'calc(100vh - 128px)', p: 3, overflow: 'auto' }}>
      <Routes>
        <Route index element={<TicketList />} />
        <Route path="new" element={<CreateTicket />} />
        <Route path=":id" element={<TicketDetail />} />
      </Routes>
    </Box>
  );
};

export default Tickets; 