import { AppRouter } from "@/router";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { useAnalytics } from "@/hooks/useAnalytics";
import "./App.scss";

const App = () => {
  useAnalytics();

  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  );
};

export default App;
