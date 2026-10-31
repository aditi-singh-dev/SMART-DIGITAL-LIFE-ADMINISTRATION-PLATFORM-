/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'selector',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#172554', // Deep Navy / Ink Blue
          indigo: '#4F46E5', // Soft Indigo Accent
          indigoHover: '#4338CA',
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          textMain: '#0F172A',
          textMuted: '#64748B',
          border: '#E2E8F0'
        },
        status: {
          valid: '#059669',
          validBg: '#ECFDF5',
          warning: '#D97706',
          warningBg: '#FFFBEB',
          expired: '#DC2626',
          expiredBg: '#FEF2F2',
          info: '#2563EB',
          infoBg: '#EFF6FF'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 6px -1px rgba(15, 23, 42, 0.02)',
        'elevated': '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'dropdown': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'glow': '0 0 20px -5px rgba(99, 102, 241, 0.35)',
      }
    },
  },
  plugins: [],
}
