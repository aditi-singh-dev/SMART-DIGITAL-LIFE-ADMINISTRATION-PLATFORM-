import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function FloatingThemeSwitcher() {
  const { theme, setTheme, isDark, toggleTheme } = useTheme();

  return (
    <aside 
      aria-label="Floating Theme Controls"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-1.5 p-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-elevated transition-all hover:shadow-xl"
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
          !isDark
            ? 'bg-amber-500 text-white shadow-xs scale-100'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Switch to Light Theme"
      >
        <Sun className="w-3.5 h-3.5" />
        <span>Light</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
          isDark
            ? 'bg-indigo-600 text-white shadow-xs scale-100'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Switch to Dark Theme"
      >
        <Moon className="w-3.5 h-3.5" />
        <span>Dark</span>
      </button>
    </aside>
  );
}
