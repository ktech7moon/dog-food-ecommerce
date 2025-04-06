import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  isThemeChanging: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Get the initial theme from localStorage or default to 'system'
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'system';
  });
  
  // Add a state to track if the theme is currently changing (for animations)
  const [isThemeChanging, setIsThemeChanging] = useState(false);
  
  // This helps us determine the actual 'light' or 'dark' theme based on system preference
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Update the theme in localStorage and the document attribute
  const setTheme = (newTheme: Theme) => {
    setIsThemeChanging(true);
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Reset the changing state after animation completes
    setTimeout(() => {
      setIsThemeChanging(false);
    }, 1000);
  };

  // Update the theme attribute on the document
  useEffect(() => {
    // Function to apply the theme to the document
    const applyTheme = (theme: 'light' | 'dark') => {
      // Update resolved theme state
      setResolvedTheme(theme);
      
      // Start theme change animation
      document.documentElement.classList.add('theme-transition');
      
      // Apply the theme by updating theme.json (done via CSS classes)
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(theme);
      
      // Remove transition class after animation completes
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
      }, 300);
    };
    
    // Handle system theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        applyTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    
    // Apply the initial theme
    if (theme === 'system') {
      applyTheme(mediaQuery.matches ? 'dark' : 'light');
    } else {
      applyTheme(theme);
    }
    
    // Listen for system theme changes
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, isThemeChanging }}>
      {children}
      
      {/* Global theme transition animation */}
      <AnimatePresence>
        {isThemeChanging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.1, 0] 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-[100] pointer-events-none"
            style={{
              background: resolvedTheme === 'dark' 
                ? 'radial-gradient(circle at center, rgba(251, 191, 36, 0.15) 0%, rgba(0, 0, 0, 0) 70%)' 
                : 'radial-gradient(circle at center, rgba(251, 191, 36, 0.15) 0%, rgba(255, 255, 255, 0) 70%)'
            }}
          >
            {/* Floating paw prints that appear during theme transition */}
            <div className="w-full h-full relative overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ 
                    opacity: 0,
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight
                  }}
                  animate={{ 
                    opacity: [0, 0.7, 0],
                    y: [0, -50, -100],
                    rotate: Math.random() * 360
                  }}
                  transition={{ 
                    duration: 1,
                    delay: i * 0.1
                  }}
                >
                  <div className={`w-5 h-5 ${resolvedTheme === 'dark' ? 'text-amber-300/40' : 'text-amber-700/40'}`}>
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                      <path d="M50 0 C60 20, 80 20, 90 10 C95 5, 95 -5, 85 -15 C75 -25, 65 -15, 70 0 Z" />
                      <path d="M50 0 C40 20, 20 20, 10 10 C5 5, 5 -5, 15 -15 C25 -25, 35 -15, 30 0 Z" />
                      <path d="M50 100 C60 80, 80 80, 90 90 C95 95, 95 105, 85 115 C75 125, 65 115, 70 100 Z" />
                      <path d="M50 100 C40 80, 20 80, 10 90 C5 95, 5 105, 15 115 C25 125, 35 115, 30 100 Z" />
                      <circle cx="50" cy="50" r="30" />
                    </svg>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}