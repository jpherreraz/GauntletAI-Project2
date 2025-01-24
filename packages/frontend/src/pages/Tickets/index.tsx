import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import TicketList from './TicketList';
import { TicketDetail } from './TicketDetail';
import CreateTicket from './CreateTicket';
import { TicketSidebar } from '../../components/tickets/TicketSidebar';

const Tickets: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 128px)' }}>
      <TicketSidebar />
      <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
        <Routes>
          <Route index element={<TicketList />} />
          <Route path="unassigned" element={<TicketList filter="unassigned" />} />
          <Route path="unsolved" element={<TicketList filter="unsolved" />} />
          <Route path="recent" element={<TicketList filter="recent" />} />
          <Route path="pending" element={<TicketList filter="pending" />} />
          <Route path="solved" element={<TicketList filter="solved" />} />
          <Route path="suspended" element={<TicketList filter="suspended" />} />
          <Route path="deleted" element={<TicketList filter="deleted" />} />
          <Route path="new" element={<CreateTicket />} />
          <Route path=":id" element={<TicketDetail />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default Tickets; 