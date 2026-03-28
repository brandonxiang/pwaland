import { RouterProvider } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import { Analytics } from '@vercel/analytics/react';
import { router } from '@/router';
import { ThemeProvider } from '@/providers/ThemeProvider';
import './App.scss';

const App = () => {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Analytics />
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;
