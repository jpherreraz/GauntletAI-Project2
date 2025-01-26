import React from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemText } from '@mui/material';
import { useTicketCounts } from '../../hooks/useTickets';

export const TicketSidebar: React.FC = () => {
  const { data: counts } = useTicketCounts();

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Ticket Overview
      </Typography>
      <List>
        <ListItem>
          <ListItemText 
            primary="Unsolved Tickets" 
            secondary={counts?.unsolved || 0} 
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Pending" 
            secondary={counts?.pending || 0} 
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Solved" 
            secondary={counts?.solved || 0} 
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Unassigned" 
            secondary={counts?.unassigned || 0} 
          />
        </ListItem>
      </List>
    </Paper>
  );
}; 