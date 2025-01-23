import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTickets, useDeleteTicket } from '../../hooks/useTickets';
import { ROUTES } from '@crm/shared/constants';
import type { TicketListParams } from '@crm/shared/types/api';
import { TicketStatus, TicketPriority } from '@crm/shared/types/ticket';

const statusColors = {
  open: 'info',
  in_progress: 'warning',
  pending: 'secondary',
  resolved: 'success',
  closed: 'default',
} as const;

const priorityColors = {
  low: 'success',
  medium: 'info',
  high: 'warning',
  urgent: 'error',
} as const;

const TicketList: React.FC = () => {
  const navigate = useNavigate();
  const [params, setParams] = useState<TicketListParams>({
    page: 1,
    perPage: 10,
  });

  const { data, isLoading } = useTickets(params);
  const deleteTicket = useDeleteTicket();

  const handlePageChange = (_: unknown, newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage + 1 }));
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setParams((prev) => ({
      ...prev,
      page: 1,
      perPage: parseInt(event.target.value, 10),
    }));
  };

  const handleTextFieldChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setParams((prev) => ({
      ...prev,
      page: 1,
      [name]: value || undefined,
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setParams((prev) => ({
      ...prev,
      page: 1,
      [name]: value || undefined,
    }));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      await deleteTicket.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4">Tickets</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(ROUTES.TICKETS + '/new')}
        >
          New Ticket
        </Button>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
        }}
      >
        <TextField
          name="search"
          label="Search"
          variant="outlined"
          size="small"
          onChange={handleTextFieldChange}
          sx={{ flexGrow: 1 }}
        />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            label="Status"
            value={params.status || ''}
            onChange={handleSelectChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value={TicketStatus.OPEN}>Open</MenuItem>
            <MenuItem value={TicketStatus.IN_PROGRESS}>In Progress</MenuItem>
            <MenuItem value={TicketStatus.PENDING}>Pending</MenuItem>
            <MenuItem value={TicketStatus.RESOLVED}>Resolved</MenuItem>
            <MenuItem value={TicketStatus.CLOSED}>Closed</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            name="priority"
            label="Priority"
            value={params.priority || ''}
            onChange={handleSelectChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value={TicketPriority.LOW}>Low</MenuItem>
            <MenuItem value={TicketPriority.MEDIUM}>Medium</MenuItem>
            <MenuItem value={TicketPriority.HIGH}>High</MenuItem>
            <MenuItem value={TicketPriority.URGENT}>Urgent</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>{ticket.title}</TableCell>
                <TableCell>
                  <Chip
                    label={ticket.status}
                    color={statusColors[ticket.status as keyof typeof statusColors]}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={ticket.priority}
                    color={
                      priorityColors[ticket.priority as keyof typeof priorityColors]
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`${ROUTES.TICKETS}/${ticket.id}`)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(ticket.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={data?.total || 0}
          page={(params.page || 1) - 1}
          rowsPerPage={params.perPage || 10}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </TableContainer>
    </Box>
  );
};

export default TicketList; 