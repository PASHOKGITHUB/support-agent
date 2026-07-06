'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function SupportConfigPage() {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [supportWebsite, setSupportWebsite] = useState('');
  const [contactFormLink, setContactFormLink] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [copiedType, setCopiedType] = useState<'link' | 'iframe' | 'widget' | null>(null);
  
  // Subscription Plan Info
  const [companyPlan, setCompanyPlan] = useState('Free');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const data = await api.get('/support');
        if (data) {
          setCompanyName(data.companyName || '');
          setSupportEmail(data.supportEmail || '');
          setSupportPhone(data.supportPhone || '');
          setSupportWebsite(data.supportWebsite || '');
          setContactFormLink(data.contactFormLink || '');
          setWorkingHours(data.workingHours || '');
          setCompanyPlan(data.companyPlan || 'Free');
          setExpiresAt(data.expiresAt || null);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch support configurations.');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      await api.post('/support', {
        companyName,
        supportEmail,
        supportPhone,
        supportWebsite,
        contactFormLink,
        workingHours
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError((err as Error).message || 'Failed to save support configuration.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 pt-24 md:pt-8 overflow-y-auto max-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
            Escalation Channels & Support
          </h1>
          <p className="text-slate-550 text-sm mt-1">
            Configure contact parameters. The AI assistant will present these details as a fallback if it cannot answer from documents.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-650 text-xs flex items-center gap-2 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-650 text-xs flex items-center gap-2 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Support configuration saved successfully!</span>
          </div>
        )}

        {loading ? (
          <div className="py-24 flex justify-center">
            <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : (
          <div className="max-w-2xl p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Company / Brand Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Support Corp"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-650 transition-colors text-xs font-semibold"
                    required
                  />
                </div>

                {/* Support Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Official Support Email</label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="help@acme.com"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-855 placeholder-slate-400 focus:outline-none focus:border-indigo-650 transition-colors text-xs font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Support Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Support Phone (Optional)</label>
                  <input
                    type="text"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-650 transition-colors text-xs font-semibold"
                  />
                </div>

                {/* Working Hours */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Working Hours (Optional)</label>
                  <input
                    type="text"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    placeholder="9:00 AM - 5:00 PM EST (Mon-Fri)"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-650 transition-colors text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Support Website */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Support Portal Website (Optional)</label>
                  <input
                    type="url"
                    value={supportWebsite}
                    onChange={(e) => setSupportWebsite(e.target.value)}
                    placeholder="https://support.acme.com"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-650 transition-colors text-xs font-semibold"
                  />
                </div>

                {/* Contact Form */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Contact Form Link (Optional)</label>
                  <input
                    type="url"
                    value={contactFormLink}
                    onChange={(e) => setContactFormLink(e.target.value)}
                    placeholder="https://acme.com/contact-us"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-650 transition-colors text-xs font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-indigo-800 disabled:to-purple-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed text-xs"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Saving configurations...</span>
                  </>
                ) : (
                  <span>Save Configuration</span>
                )}
              </button>
            </form>
          </div>
        )}

        {!loading && (
          <div className="max-w-2xl mt-8 p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-800">Subscription & Storage Plan</h2>
                <p className="text-[10px] text-slate-500 mt-0.5">Your current business workspace limit constraints.</p>
              </div>
              <Link href="/billing" className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 font-bold rounded-xl text-[10px] transition-all cursor-pointer">
                Change Plan
              </Link>
            </div>

            <div className="flex justify-between items-center text-xs">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active plan tier</p>
                <p className="font-extrabold text-slate-700">{companyPlan} Plan</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expiration Date</p>
                <p className="font-semibold text-slate-650">
                  {expiresAt ? new Date(expiresAt).toLocaleDateString() : 'Lifetime Active'}
                </p>
              </div>
            </div>
          </div>
        )}

        {!loading && (
          <div className="max-w-2xl mt-8 p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-100 gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-800">Shareable Customer Chat Link</h2>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Direct shareable link to open the customer-facing full-screen chat assistant.
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/embed/chat?companyId=${user?.companyId || 'YOUR_COMPANY_ID'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-sm"
                >
                  Launch Chat ↗
                </a>
                <button
                  onClick={() => {
                    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
                    const link = `${origin}/embed/chat?companyId=${user?.companyId || 'YOUR_COMPANY_ID'}`;
                    navigator.clipboard.writeText(link);
                    setCopiedType('link');
                    setTimeout(() => setCopiedType(null), 2000);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-sm"
                >
                  {copiedType === 'link' ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-900 text-slate-200 rounded-2xl text-xs font-mono overflow-x-auto border border-slate-800 whitespace-pre-wrap select-all font-semibold leading-relaxed">
              {`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/embed/chat?companyId=${user?.companyId || 'YOUR_COMPANY_ID'}`}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
