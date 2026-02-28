import { useEffect, useState, ReactNode, createContext, useContext } from 'react';
import { ConfigProvider, theme } from 'antd';

const { defaultAlgorithm, darkAlgorithm } = theme;

const THEME_STORAGE_KEY = 'pwaland-theme-preference';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  isDark: boolean;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    // Load from localStorage or default to 'system'
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
      return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
    }
    return 'system';
  });

  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Calculate actual dark mode state
  const isDark = themeMode === 'system' ? systemIsDark : themeMode === 'dark';

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Update document root class for CSS-based dark mode support
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  const toggleTheme = () => {
    if (themeMode === 'system') {
      // If currently system, toggle to opposite of current system preference
      setThemeMode(systemIsDark ? 'light' : 'dark');
    } else {
      // Toggle between light and dark
      setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, themeMode, toggleTheme, setThemeMode }}>
      <ConfigProvider
        theme={{
          algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
          token: {
            // Optional: customize tokens for dark mode
            // colorPrimary: '#1890ff',
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
