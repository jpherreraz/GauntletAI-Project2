import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { theme } from './theme';
import { App } from './App';

console.log('🔍 main.tsx: Starting application initialization');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ main.tsx: Root element not found!');
  throw new Error('Root element not found');
}

console.log('✅ main.tsx: Root element found');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

console.log('✅ main.tsx: QueryClient initialized');

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <App />
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
  console.log('✅ main.tsx: Application rendered successfully');
} catch (error) {
  console.error('❌ main.tsx: Error rendering application:', error);
} 