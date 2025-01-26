import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import {
  QuestionAnswer as FAQIcon,
  ConfirmationNumber as TicketsIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@crm/shared/constants';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '@crm/shared/types/user';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const role = user?.user_metadata?.role;

  // Define navigation items based on user role
  const navigationItems = React.useMemo(() => {
    switch (role) {
      case UserRole.CUSTOMER:
        return [
          {
            text: 'FAQ',
            icon: <FAQIcon />,
            path: ROUTES.FAQ,
          },
          {
            text: 'Tickets',
            icon: <TicketsIcon />,
            path: ROUTES.TICKETS,
          },
        ];
      case UserRole.WORKER:
        return [
          {
            text: 'Tickets',
            icon: <TicketsIcon />,
            path: ROUTES.TICKETS,
          },
        ];
      case UserRole.ADMIN:
        return [
          {
            text: 'Dashboard',
            icon: <DashboardIcon />,
            path: ROUTES.DASHBOARD,
          },
          {
            text: 'Tickets',
            icon: <TicketsIcon />,
            path: ROUTES.TICKETS,
          },
          {
            text: 'Manage FAQ',
            icon: <FAQIcon />,
            path: ROUTES.MANAGE_FAQ,
          },
        ];
      default:
        return [];
    }
  }, [role]);

  return (
    <List>
      {navigationItems.map((item) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default Navigation; 