export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  FAQ: '/faq',
  MANAGE_FAQ: '/manage-faq',
  TICKETS: '/tickets',
  TICKET_DETAILS: (id: string) => `/tickets/${id}`,
  USERS: '/users',
  USER_DETAILS: (id: string) => `/users/${id}`,
  PROFILE: '/profile',
  SETTINGS: '/settings',
  REPORTS: '/reports',
  STATISTICS: '/statistics',
} as const;

export type Routes = typeof ROUTES; 