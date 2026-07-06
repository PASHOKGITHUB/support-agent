'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/BrandLogo';
import Link from 'next/link';

export default function TestUserPage() {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState('');
  const [tempId, setTempId] = useState('');

  // Set initial company ID based on query parameter or logged-in user
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryId = params.get('companyId');
      if (queryId) {
        setCompanyId(queryId);
        setTempId(queryId);
      } else if (user?.companyId) {
        setCompanyId(user.companyId);
        setTempId(user.companyId);
      } else {
        // Fallback default demo workspace ID
        const fallbackId = '6a4b2f30254e8076b4509b99';
        setCompanyId(fallbackId);
        setTempId(fallbackId);
      }
    }
  }, [user]);

  // Load / Reload the floating widget script dynamically when company ID changes
  useEffect(() => {
    if (!companyId) return;

    // Remove existing container and styles from previous widget loads
    const existingContainers = document.querySelectorAll('.support-agent-widget-container');
    existingContainers.forEach(container => container.remove());
    
    // Configure widget config on window
    (window as any).SupportAgentConfig = {
      companyId: companyId,
      origin: window.location.origin
    };

    // Append script to body
    const script = document.createElement('script');
    script.src = '/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
      const containers = document.querySelectorAll('.support-agent-widget-container');
      containers.forEach(container => container.remove());
    };
  }, [companyId]);

  const applyWorkspaceId = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempId.trim()) {
      setCompanyId(tempId.trim());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sandbox Controller Bar */}
      <header className="sticky top-0 z-50 bg-[#0b0f19] text-white py-4 px-6 shadow-md border-b border-indigo-900/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-7 w-7 text-indigo-400" />
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white">SupportAgent.ai</span>
              <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full ml-2">
                Sandbox Simulator
              </span>
            </div>
          </div>

          <form onSubmit={applyWorkspaceId} className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 shrink-0">
              Workspace ID:
            </label>
            <input
              type="text"
              value={tempId}
              onChange={(e) => setTempId(e.target.value)}
              placeholder="Enter Company ID"
              className="bg-[#141b2e] border border-indigo-900/50 rounded-xl px-3 py-1.5 text-xs text-indigo-200 focus:outline-none focus:border-indigo-500 font-mono w-full md:w-64"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
            >
              Apply Widget
            </button>
          </form>

          {user?.companyId && companyId !== user.companyId && (
            <button
              onClick={() => {
                setCompanyId(user.companyId || '');
                setTempId(user.companyId || '');
              }}
              className="text-[10px] text-slate-400 hover:text-white transition-all underline font-semibold cursor-pointer"
            >
              Reset to my Workspace
            </button>
          )}
        </div>
      </header>

      {/* Mock Client Website Content */}
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {/* Banner Alert */}
        <div className="bg-indigo-50 border border-indigo-150 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-indigo-900">
              🚀 Client Chat Integration Sandbox is Active
            </h2>
            <p className="text-xs text-indigo-750 font-medium">
              We have loaded your custom floating support chat widget in the bottom-right corner of this page. Click it to begin testing!
            </p>
          </div>
          <Link
            href="/integration"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-sm shrink-0"
          >
            Get Code Snippets
          </Link>
        </div>

        {/* Hero Section */}
        <section className="text-center py-8 space-y-4">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
            Acme eCommerce & Support Sandbox
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Welcome to the Customer Testing Portal
          </h1>
          <p className="text-slate-550 max-w-2xl mx-auto text-sm leading-relaxed font-medium">
            This simulator allows you to experience exactly what your business website visitors see. The bubble chat integrates with the documents you uploaded in your admin console to answer client questions instantly.
          </p>
        </section>

        {/* Feature grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm">
            <span className="text-2xl">📦</span>
            <h3 className="font-bold text-slate-800 text-sm">Real-time Responses</h3>
            <p className="text-slate-500 text-xs leading-relaxed font-semibold">
              The widget reads and analyzes support questions in real-time, fetching answers from context vectors.
            </p>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm">
            <span className="text-2xl">⚡</span>
            <h3 className="font-bold text-slate-800 text-sm">Escalation Handlers</h3>
            <p className="text-slate-500 text-xs leading-relaxed font-semibold">
              If the AI cannot answer your query, it will automatically present fallback phone numbers and forms.
            </p>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm">
            <span className="text-2xl">🛠️</span>
            <h3 className="font-bold text-slate-800 text-sm">Live Configuration</h3>
            <p className="text-slate-500 text-xs leading-relaxed font-semibold">
              Any changes made in the dashboard settings will automatically reflect when reloading the script.
            </p>
          </div>
        </section>

        {/* Fake E-Commerce Content */}
        <section className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Featured Store Products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Developer Pro Kit', price: '$299' },
              { name: 'Ultra Wireless Hub', price: '$149' },
              { name: 'Smart Indexing Node', price: '$89' },
              { name: 'SaaS Vector Hub', price: '$499' }
            ].map((p, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-all">
                <div className="h-32 bg-slate-100 flex items-center justify-center text-3xl">💻</div>
                <div className="p-4 space-y-1 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">{p.name}</h4>
                    <p className="text-[10px] text-slate-500">Premium quality business gear.</p>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                    <span className="text-xs font-extrabold text-slate-900">{p.price}</span>
                    <button className="px-2.5 py-1 bg-slate-950 text-white text-[9px] font-bold rounded-lg hover:bg-slate-800 transition-all cursor-pointer">
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mock FAQs */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8 space-y-4 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-900">Frequently Asked Questions</h3>
          <div className="divide-y divide-slate-100 text-xs space-y-4">
            <div className="pt-2">
              <h4 className="font-bold text-slate-800">How do I test my documents?</h4>
              <p className="text-slate-500 mt-1">Upload documents in the Knowledge Base panel of the dashboard. Once indexed, open the widget in the bottom-right and start chatting!</p>
            </div>
            <div className="pt-4">
              <h4 className="font-bold text-slate-800">What happens if the AI fails?</h4>
              <p className="text-slate-500 mt-1">It automatically looks up fallback email and phone parameters from the Support Configurations and provides them as escalation options.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
