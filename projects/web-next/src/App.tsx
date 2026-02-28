import { RouterProvider } from 'react-router';
import { router } from '@/router';
import { ThemeProvider } from '@/providers/ThemeProvider';
import './App.scss';

const App = () => {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export default App;
