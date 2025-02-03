import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  useTheme,
  styled,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ConfirmationNumber as TicketsIcon,
  People as UsersIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  QuestionAnswer as FAQIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@crm/shared/constants';
import { UserRole } from '@crm/shared/types';
import { useAuth } from '../../contexts/AuthContext';

const DRAWER_WIDTH = 240;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
    marginTop: theme.spacing(8), // Space for AppBar
    height: `calc(100% - ${theme.spacing(8)})`,
  },
}));

interface NavItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    text: 'FAQ',
    icon: <FAQIcon />,
    path: ROUTES.FAQ,
    roles: [UserRole.CUSTOMER],
  },
  {
    text: 'Tickets',
    icon: <TicketsIcon />,
    path: ROUTES.TICKETS,
    roles: [UserRole.CUSTOMER, UserRole.ADMIN, UserRole.WORKER],
  },
];

export const Sidebar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();

  console.log('🔍 Sidebar: Rendering with profile:', {
    profile,
    role: profile?.role,
    hasProfile: !!profile,
    navItems: navItems.map(item => ({
      text: item.text,
      allowedRoles: item.roles
    }))
  });

  // Filter nav items based on user role from profile
  const filteredNavItems = React.useMemo(() => {
    console.log('🔍 Sidebar: Filtering nav items:', {
      profileRole: profile?.role,
      availableItems: navItems.map(item => ({
        text: item.text,
        allowedRoles: item.roles
      }))
    });

    if (!profile?.role) {
      console.log('❌ Sidebar: No role found in profile');
      return [];
    }

    const filtered = navItems.filter(item => item.roles.includes(profile.role));
    console.log('✅ Sidebar: Filtered items:', filtered);
    return filtered;
  }, [profile?.role]);

  if (!profile) {
    console.log('❌ Sidebar: No profile available, returning null');
    return null;
  }

  console.log('✅ Sidebar: Rendering with filtered items:', filteredNavItems);

  return (
    <StyledDrawer variant="permanent">
      <List>
        {filteredNavItems.map((item) => {
          console.log('🔍 Sidebar: Rendering item:', item);
          return (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main + '20',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main + '30',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path
                    ? theme.palette.primary.main
                    : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  color: location.pathname === item.path
                    ? theme.palette.primary.main
                    : 'inherit',
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </StyledDrawer>
  );
}; 