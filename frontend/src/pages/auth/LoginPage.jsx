import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { ShieldCheck, ArrowRight, Lock, Mail } from 'lucide-react';
import { ThemeToggle } from '../../context/ThemeContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res.success) {
        login(res.token, res.user);
        success('Welcome back to GharSahayak!');
        if (!res.user.familyId) {
          navigate('/family-setup');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      error(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
          <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">GharSahayak</span>
        </Link>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Sign in to your family workspace</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Enter your credentials to access verified family records.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@family.in"
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-center">
              Quick One-Click Demo Logins
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleFillDemo('aditi@singhfamily.in')}
                className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:border-indigo-400 active:scale-95"
              >
                <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate">👑 Aditi</span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('rajesh@singhfamily.in')}
                className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:border-indigo-400 active:scale-95"
              >
                <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate">👨 Rajesh</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Adult</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('priya@singhfamily.in')}
                className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:border-indigo-400 active:scale-95"
              >
                <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate">🎓 Priya</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Student</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
