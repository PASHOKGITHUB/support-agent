'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/BrandLogo';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name.trim()) {
          throw new Error('Name is required.');
        }
        await register(name, email, password);
      }
    } catch (err) {
      setError((err as Error).message || 'Authentication failed.');
      setFormLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-6 bg-[#07080e] relative min-h-screen overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Branding Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-4">
            <BrandLogo className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
            Invaccs Agent
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            AI-powered customer support grounding platform
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl shadow-2xl p-8 relative overflow-hidden backdrop-blur-md">
          {/* Tab Switcher */}
          <div className="flex p-1 bg-slate-950/80 rounded-xl border border-slate-800/40 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 cursor-pointer ${isLogin ? 'bg-indigo-650 text-white shadow-md shadow-indigo-600/10' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 cursor-pointer ${!isLogin ? 'bg-indigo-650 text-white shadow-md shadow-indigo-600/10' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all text-base md:text-sm"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all text-base md:text-sm"
                required
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all text-base md:text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="w-full py-3 mt-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-650 disabled:from-indigo-850 disabled:to-indigo-900 text-white font-semibold rounded-xl transition-all duration-300 shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed text-sm"
            >
              {formLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
