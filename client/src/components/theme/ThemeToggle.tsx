import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
  const { setTheme, resolvedTheme, isThemeChanging } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === 'dark';
  
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="relative overflow-hidden w-10 h-10 rounded-full border border-accent/50 hover:border-accent"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={resolvedTheme}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {isDark ? (
              <div className="flex items-center justify-center relative">
                <Moon className="h-5 w-5 text-amber-200" />
                <motion.div 
                  className="absolute w-1.5 h-1.5 rounded-full bg-amber-300" 
                  style={{ top: '-4px', left: '0px' }}
                  animate={{ y: [0, -1, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div 
                  className="absolute w-1 h-1 rounded-full bg-amber-300" 
                  style={{ top: '-2px', right: '-3px' }}
                  animate={{ y: [0, -1, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center relative">
                <Sun className="h-5 w-5 text-amber-500" />
                <motion.div 
                  className="absolute w-full h-full rounded-full bg-amber-500/20" 
                  animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.1, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Paw Print Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute rounded-full w-2 h-2 ${isDark ? 'bg-amber-300/40' : 'bg-amber-700/40'}`} style={{ top: '3px', left: '4px' }}></div>
          <div className={`absolute rounded-full w-2 h-2 ${isDark ? 'bg-amber-300/40' : 'bg-amber-700/40'}`} style={{ top: '3px', right: '4px' }}></div>
          <div className={`absolute rounded-full w-2.5 h-2.5 ${isDark ? 'bg-amber-300/40' : 'bg-amber-700/40'}`} style={{ bottom: '5px', left: '3px' }}></div>
          <div className={`absolute rounded-full w-2.5 h-2.5 ${isDark ? 'bg-amber-300/40' : 'bg-amber-700/40'}`} style={{ bottom: '5px', right: '3px' }}></div>
          <div className={`absolute rounded-full w-3 h-3 ${isDark ? 'bg-amber-300/40' : 'bg-amber-700/40'}`} style={{ bottom: '2px', left: '50%', transform: 'translateX(-50%)' }}></div>
        </div>
      </Button>
      
      {/* Dog animation when theme changes */}
      <AnimatePresence>
        {isThemeChanging && (
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ 
              scale: [0, 1.2, 1.2, 0],
              rotate: [0, 10, -10, 5, -5, 0],
              y: [0, -15, -20, -15, 0]
            }}
            exit={{ scale: 0 }}
            transition={{ 
              duration: 1.2,
              times: [0, 0.2, 0.7, 0.9, 1]
            }}
            className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none flex items-center justify-center z-50"
          >
            <div className="relative">
              {/* Dog face */}
              <div className={`w-16 h-16 rounded-full ${isDark ? 'bg-amber-300' : 'bg-amber-700'} relative`}>
                {/* Eyes - animate blinking */}
                <motion.div 
                  className="absolute w-2 h-3 bg-black rounded-full left-4 top-4"
                  animate={{ height: [3, 0.5, 3], y: [0, 1, 0] }}
                  transition={{ duration: 0.3, times: [0, 0.5, 1], repeat: 1, repeatDelay: 0.5 }}
                />
                <motion.div 
                  className="absolute w-2 h-3 bg-black rounded-full right-4 top-4"
                  animate={{ height: [3, 0.5, 3], y: [0, 1, 0] }}
                  transition={{ duration: 0.3, times: [0, 0.5, 1], repeat: 1, repeatDelay: 0.5 }}
                />
                
                {/* Nose */}
                <div className="absolute w-3.5 h-2.5 bg-black rounded-full left-1/2 top-8 -translate-x-1/2"></div>
                
                {/* Mouth - animated for barking */}
                <motion.div 
                  className="absolute w-8 h-1.5 bg-black rounded-full left-1/2 top-11 -translate-x-1/2"
                  animate={{ 
                    height: [1.5, 3, 1.5, 3, 1.5],
                    y: [0, -1, 0, -1, 0]
                  }}
                  transition={{ duration: 0.8, times: [0, 0.25, 0.5, 0.75, 1] }}
                />
                
                {/* Tongue - appears when barking */}
                <motion.div 
                  className="absolute w-4 h-0 bg-red-400 rounded-b-lg left-1/2 -translate-x-1/2"
                  style={{ top: "calc(11px + 1.5px)" }}
                  animate={{ 
                    height: [0, 4, 0, 4, 0],
                    y: [0, 0, 0, 0, 0]
                  }}
                  transition={{ duration: 0.8, times: [0, 0.25, 0.5, 0.75, 1] }}
                />
                
                {/* Ears - bounce effect */}
                <motion.div 
                  className={`absolute w-5 h-5 ${isDark ? 'bg-amber-500' : 'bg-amber-900'} rounded-full -left-1 -top-1`}
                  animate={{ 
                    y: [0, -2, 0, -2, 0],
                    x: [0, -1, 0, -1, 0]
                  }}
                  transition={{ duration: 0.8, times: [0, 0.25, 0.5, 0.75, 1] }}
                />
                <motion.div 
                  className={`absolute w-5 h-5 ${isDark ? 'bg-amber-500' : 'bg-amber-900'} rounded-full -right-1 -top-1`}
                  animate={{ 
                    y: [0, -2, 0, -2, 0],
                    x: [0, 1, 0, 1, 0]
                  }}
                  transition={{ duration: 0.8, times: [0, 0.25, 0.5, 0.75, 1] }}
                />
                
                {/* Tail - wagging animation */}
                <motion.div 
                  className={`absolute w-3 h-6 ${isDark ? 'bg-amber-400' : 'bg-amber-800'} rounded-full`}
                  style={{ bottom: "-3px", right: "-5px", transformOrigin: "50% 0%" }}
                  animate={{ 
                    rotate: [0, 30, -30, 30, 0],
                  }}
                  transition={{ duration: 0.8, times: [0, 0.25, 0.5, 0.75, 1] }}
                />
              </div>
              
              {/* Barking animation text */}
              <motion.div
                animate={{ 
                  opacity: [0, 1, 0, 1, 0],
                  x: [0, 10, 20, 30, 40]
                }}
                transition={{ duration: 1.2, times: [0, 0.25, 0.5, 0.75, 1] }}
                className="absolute -right-8 top-4 text-sm font-bold"
              >
                {isDark ? "Night mode!" : "Day mode!"}
              </motion.div>
              
              {/* Moon/Sun icon based on theme */}
              <motion.div
                className="absolute -top-8 left-1/2 -translate-x-1/2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: [0, 1, 0], y: [10, 0, -10], rotate: [0, 180, 360] }}
                transition={{ duration: 1.2 }}
              >
                {isDark ? (
                  <Moon className="h-6 w-6 text-amber-200" />
                ) : (
                  <Sun className="h-6 w-6 text-amber-500" />
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}