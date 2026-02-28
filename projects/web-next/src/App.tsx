import { RouterProvider } from 'react-router';
import { Analytics } from '@vercel/analytics/react';
import { router } from '@/router';
import { ThemeProvider } from '@/providers/ThemeProvider';
import './App.scss';

const App = () => {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Analytics />
    </ThemeProvider>
  );
};

export default App;
