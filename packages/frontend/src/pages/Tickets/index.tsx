import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TicketList from './TicketList';
import { TicketDetail } from './TicketDetail';
import CreateTicket from './CreateTicket';

const Tickets: React.FC = () => {
  return (
    <Routes>
      <Route index element={<TicketList />} />
      <Route path="new" element={<CreateTicket />} />
      <Route path=":id" element={<TicketDetail />} />
    </Routes>
  );
};

export default Tickets; 