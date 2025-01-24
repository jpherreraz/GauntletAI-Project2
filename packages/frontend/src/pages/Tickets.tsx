import { Box } from '@mui/material';
import { TicketSidebar } from '../components/tickets/TicketSidebar';
import { Outlet } from 'react-router-dom';

export const TicketsPage = () => {
  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <TicketSidebar />
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}; 