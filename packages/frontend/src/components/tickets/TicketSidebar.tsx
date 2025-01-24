import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Skeleton } from '@mui/material';
import { Assignment, Update, Pending, CheckCircle, Block, Delete } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '@crm/shared/types';
import { useTicketCounts } from '../../hooks/useTickets';

interface TicketCategory {
  label: string;
  countKey: keyof TicketCounts;
  icon: React.ReactNode;
  path: string;
}

interface TicketCounts {
  unassigned: number;
  unsolved: number;
  recent: number;
  pending: number;
  solved: number;
  suspended: number;
  deleted: number;
}

export const TicketSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { data: counts, isLoading } = useTicketCounts();

  // Don't render the sidebar for customers
  if (user?.user_metadata?.role === UserRole.CUSTOMER) {
    return null;
  }

  const categories: TicketCategory[] = [
    { label: 'Unassigned tickets', countKey: 'unassigned', icon: <Assignment />, path: '/tickets/unassigned' },
    { label: 'All unsolved tickets', countKey: 'unsolved', icon: <Assignment />, path: '/tickets/unsolved' },
    { label: 'Recently updated tickets', countKey: 'recent', icon: <Update />, path: '/tickets/recent' },
    { label: 'Pending tickets', countKey: 'pending', icon: <Pending />, path: '/tickets/pending' },
    { label: 'Recently solved tickets', countKey: 'solved', icon: <CheckCircle />, path: '/tickets/solved' },
    { label: 'Suspended tickets', countKey: 'suspended', icon: <Block />, path: '/tickets/suspended' },
    { label: 'Deleted tickets', countKey: 'deleted', icon: <Delete />, path: '/tickets/deleted' },
  ];

  return (
    <Paper elevation={0} sx={{ width: 280, borderRight: 1, borderColor: 'divider', height: '100%' }}>
      <List>
        {categories.map((category) => (
          <ListItem key={category.path} disablePadding>
            <ListItemButton
              selected={location.pathname === category.path}
              onClick={() => navigate(category.path)}
            >
              <ListItemIcon>{category.icon}</ListItemIcon>
              <ListItemText 
                primary={category.label}
                secondary={
                  isLoading ? (
                    <Skeleton width={20} />
                  ) : (
                    `(${counts?.[category.countKey] ?? 0})`
                  )
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}; 