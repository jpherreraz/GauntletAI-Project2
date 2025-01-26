import React from 'react';
import { Navigate, RouteObject, useLocation } from 'react-router-dom';
import { ROUTES } from '@crm/shared/constants';
import { UserRole } from '@crm/shared/types/user';
import Layout from '../components/Layout';
import FAQ from '../pages/FAQ';
import ManageFAQ from '../pages/FAQ/ManageFAQ';
import Statistics from '../pages/Statistics';
import TicketList from '../pages/Tickets/TicketList';
import CreateTicket from '../pages/Tickets/CreateTicket';
import TicketDetails from '../pages/Tickets/TicketDetails';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC<{
  element: React.ReactNode;
  allowedRoles?: UserRole[];
  defaultRedirect?: string;
}> = ({ element, allowedRoles, defaultRedirect = ROUTES.TICKETS }) => {
  const { user } = useAuth();
  const userRole = user?.user_metadata?.role as UserRole;

  if (!allowedRoles || allowedRoles.includes(userRole)) {
    return <>{element}</>;
  }

  return <Navigate to={defaultRedirect} replace />;
};

const DefaultRedirect: React.FC = () => {
  const { user } = useAuth();
  const role = user?.user_metadata?.role;

  if (role === UserRole.ADMIN) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  } else if (role === UserRole.WORKER) {
    return <Navigate to={ROUTES.TICKETS} replace />;
  } else {
    return <Navigate to={ROUTES.FAQ} replace />;
  }
};

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <DefaultRedirect />,
      },
      {
        path: ROUTES.FAQ,
        element: (
          <ProtectedRoute
            element={<FAQ />}
            allowedRoles={[UserRole.CUSTOMER]}
            defaultRedirect={ROUTES.TICKETS}
          />
        ),
      },
      {
        path: ROUTES.MANAGE_FAQ,
        element: (
          <ProtectedRoute
            element={<ManageFAQ />}
            allowedRoles={[UserRole.ADMIN]}
          />
        ),
      },
      {
        path: ROUTES.DASHBOARD,
        element: (
          <ProtectedRoute
            element={<Statistics />}
            allowedRoles={[UserRole.ADMIN]}
          />
        ),
      },
      {
        path: ROUTES.TICKETS,
        children: [
          {
            index: true,
            element: <TicketList />,
          },
          {
            path: 'new',
            element: (
              <ProtectedRoute
                element={<CreateTicket />}
                allowedRoles={[UserRole.CUSTOMER]}
              />
            ),
          },
          {
            path: ':id',
            element: <TicketDetails />,
          },
        ],
      },
    ],
  },
];

export default routes; 