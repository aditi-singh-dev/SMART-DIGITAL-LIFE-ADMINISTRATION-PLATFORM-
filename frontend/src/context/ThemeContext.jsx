import React, { createContext, useContext, useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem('gharsahayak_theme') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('gharsahayak_theme');
      if (saved === 'dark') return true;
      if (saved === 'system') {
        return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return false;
    } catch (e) {
      return false;
    }
  });

  const applyThemeToDOM = (themeMode) => {
    let darkActive = false;
    if (themeMode === 'dark') {
      darkActive = true;
    } else if (themeMode === 'system') {
      darkActive = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      darkActive = false;
    }

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const body = document.body;

      if (darkActive) {
        root.classList.add('dark');
        body?.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        body?.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
      }
    }

    setIsDark(darkActive);
  };

  useEffect(() => {
    applyThemeToDOM(theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      try {
        const current = localStorage.getItem('gharsahayak_theme') || 'light';
        if (current === 'system') {
          applyThemeToDOM('system');
        }
      } catch (e) {}
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('gharsahayak_theme', newTheme);
    } catch (e) {}
    // Apply synchronously without waiting for useEffect
    applyThemeToDOM(newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeToggle({ className = '', compact = false }) {
  const { theme, setTheme, isDark, toggleTheme } = useTheme();

  if (compact) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleTheme();
        }}
        className={`p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 active:scale-95 ${className}`}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-slate-700 dark:text-slate-200 transition-transform rotate-0 hover:-rotate-12" />
        )}
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setTheme('light');
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
          theme === 'light'
            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        <Sun className="w-3.5 h-3.5 text-amber-500" />
        <span>Light</span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setTheme('dark');
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
          theme === 'dark'
            ? 'bg-slate-900 text-white shadow-sm border border-slate-700'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        <Moon className="w-3.5 h-3.5 text-indigo-400" />
        <span>Dark</span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setTheme('system');
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
          theme === 'system'
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-slate-600'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        <Monitor className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
        <span className="hidden sm:inline">System</span>
      </button>
    </div>
  );
}
