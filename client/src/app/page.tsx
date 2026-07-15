'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import DotField from '../components/DotField';
import { BrandLogo } from '../components/BrandLogo';

export default function LandingPage() {
  const { user } = useAuth();
  const [copiedWidget, setCopiedWidget] = useState(false);

  const handleCopyWidget = () => {
    const code = `<script>
  window.SupportAgentConfig = {
    companyId: "your-workspace-hash",
    origin: "https://supportagent.ai"
  };
</script>
<script src="https://supportagent.ai/widget.js" async></script>`;
    navigator.clipboard.writeText(code);
    setCopiedWidget(true);
    setTimeout(() => setCopiedWidget(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07080e] text-[#f1f5f9] flex flex-col font-sans overflow-x-hidden relative selection:bg-indigo-650 selection:text-white">
      {/* Interactive DotField Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <DotField
          dotRadius={1.2}
          dotSpacing={20}
          bulgeStrength={90}
          glowRadius={250}
          sparkle={true}
          waveAmplitude={0.8}
          gradientFrom="rgba(99, 102, 241, 0.22)"
          gradientTo="rgba(168, 85, 247, 0.12)"
          glowColor="rgba(99, 102, 241, 0.18)"
        />
      </div>

      {/* Corporate Backdrop Blur Highlights */}
      <div className="absolute top-[-15%] left-[-5%] w-[60%] h-[50%] rounded-full bg-indigo-500/8 blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-purple-500/6 blur-[140px] pointer-events-none z-0" />

      {/* Header Bar */}
      <header className="w-full border-b border-slate-900/50 backdrop-blur-md sticky top-0 bg-[#07080e]/60 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo />
            <div>
              <span className="text-lg font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
                Invaccs Agent
              </span>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Enterprise SaaS Platform</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#integration" className="hover:text-white transition-colors">Integration</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href={user ? '/dashboard' : '/login'}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-650 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/10 hover:-translate-y-0.5 cursor-pointer"
            >
              {user ? 'Enter Console' : 'Get Started Free'}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1">
        <section className="max-w-7xl mx-auto px-6 py-28 flex flex-col items-center text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-bold text-indigo-400 tracking-wide uppercase">
            <span>⚡ VERSION 2.5 STABLE RELEASE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-100 to-slate-400">
            Automate Customer Support <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-indigo-350 to-purple-400">
              Grounded on Your Knowledge Base
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed font-medium">
            Deploy self-healing support widgets trained instantly on your company docs. Let AI resolve customer inquiries securely without hallucinations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm pt-4">
            <Link
              href="/login"
              className="px-6 py-3.5 bg-white text-slate-950 hover:bg-indigo-50 font-extrabold rounded-xl text-sm transition-all shadow-md shadow-white/5 hover:shadow-indigo-500/10 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-center duration-200"
            >
              Start Free Trial
            </Link>
            <a
              href="#features"
              className="px-6 py-3.5 bg-slate-900/40 hover:bg-slate-900/85 text-slate-200 font-bold rounded-xl text-sm transition-all border border-slate-800 backdrop-blur-sm hover:-translate-y-0.5 active:translate-y-0 hover:border-slate-700 cursor-pointer text-center duration-200"
            >
              See How It Works
            </a>
          </div>

          {/* Interactive Interface Preview */}
          <div className="w-full max-w-5xl mt-16 p-2 bg-slate-900/35 border border-slate-800/80 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-purple-500/2 to-transparent pointer-events-none" />
            
            {/* Terminal Top Window Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/80 text-xs text-slate-400 font-semibold font-mono">
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/20" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-500/20" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500/20" />
              </div>
              <span className="text-slate-300 font-medium">Invaccs Agent — Interactive Console Mockup</span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE</span>
              </div>
            </div>

            {/* Split Screen Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-slate-900/80">
              
              {/* Left Column: Console Sidebar / Doc Status (4 cols) */}
              <div className="lg:col-span-4 p-5 space-y-5 bg-slate-950/40 text-left">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Active Knowledge Base</span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">124 Vector Docs</span>
                    <span className="text-xs text-indigo-400 font-semibold">98.4% CSAT</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full w-[80%] bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Chunking Pipeline</span>
                  <div className="space-y-2 font-mono text-[11px] text-slate-400">
                    <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg border border-slate-900">
                      <span className="truncate text-slate-300">📄 faqs-shipping.pdf</span>
                      <span className="text-emerald-400 text-[10px] font-semibold bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-900/30">Indexed</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg border border-slate-900">
                      <span className="truncate text-slate-300">📄 return-policy.md</span>
                      <span className="text-emerald-400 text-[10px] font-semibold bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-900/30">Indexed</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg border border-slate-900">
                      <span className="truncate text-slate-400">📄 api-reference.docx</span>
                      <span className="text-indigo-400 text-[10px] font-semibold bg-indigo-950/30 px-1.5 py-0.5 rounded border border-indigo-900/30 animate-pulse">Syncing...</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Chat Simulator Screen (8 cols) */}
              <div className="lg:col-span-8 p-5 bg-slate-950/20 text-left flex flex-col justify-between min-h-[280px]">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Retrieval Simulator</span>
                    <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md font-mono text-[10px] font-bold">RAG Mode Active</span>
                  </div>

                  {/* Message Stream */}
                  <div className="space-y-3.5 text-xs">
                    {/* User message */}
                    <div className="flex justify-end">
                      <div className="max-w-[75%] bg-slate-900 border border-slate-800 text-slate-100 px-4 py-3 rounded-2xl rounded-tr-sm shadow-md font-medium leading-relaxed">
                        How does the floating chat widget match our brand color?
                      </div>
                    </div>

                    {/* AI Agent message */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-655 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20 text-white font-black text-[10px]">
                        AI
                      </div>
                      <div className="max-w-[80%] space-y-2">
                        <div className="bg-indigo-950/30 border border-indigo-900/50 text-indigo-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-md leading-relaxed font-medium">
                          Grounded on <strong className="text-white">branding-guide.md</strong>: You can specify custom themes in the console settings under Support Config. The scripts automatically inject this configuration, adjusting the floating icon and chat headers instantly.
                        </div>
                        
                        {/* Grounding Source Info */}
                        <div className="flex flex-wrap md:inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 border border-slate-850 rounded-lg text-[10px] text-slate-400 font-semibold font-mono">
                          <span className="text-indigo-400 shrink-0">🔍 Source:</span>
                          <span className="break-all">branding-guide.md (chunk #2, similarity 0.94)</span>
                          <span className="text-emerald-400 shrink-0">✓ Grounded</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-900 flex items-center justify-between gap-3">
                  <div className="flex-1 bg-slate-950/60 border border-slate-900 px-4 py-2.5 rounded-xl text-slate-500 text-xs font-semibold">
                    Ask simulated RAG agent...
                  </div>
                  <div className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all">
                    Simulate
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-28 border-t border-slate-900">
          <div className="max-w-xl mb-16 space-y-3 text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">Built for Enterprise Isolation</h2>
            <p className="text-sm sm:text-base text-slate-400 font-semibold leading-relaxed">
              We separate tenant indexes, databases, and configuration settings completely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-8 bg-slate-900/10 hover:bg-slate-900/35 border border-slate-900/80 hover:border-indigo-500/30 rounded-3xl transition-all duration-300 space-y-5 hover:-translate-y-1 relative group overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-all shadow-inner">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m-3-3h6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">Retrieval-Augmented Generation (RAG)</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Chunk files dynamically. Context queries inject only relevant paragraphs into the LLM context to block hallucination cycles.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-8 bg-slate-900/10 hover:bg-slate-900/35 border border-slate-900/80 hover:border-indigo-500/30 rounded-3xl transition-all duration-300 space-y-5 hover:-translate-y-1 relative group overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/3 rounded-full blur-xl pointer-events-none group-hover:bg-purple-500/8 transition-colors" />
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-all shadow-inner">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">Role-Based Access Control (RBAC)</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Enforce controls at the database level. Lock critical configs under Admin oversight while letting Agents respond to tickets.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-8 bg-slate-900/10 hover:bg-slate-900/35 border border-slate-900/80 hover:border-indigo-500/30 rounded-3xl transition-all duration-300 space-y-5 hover:-translate-y-1 relative group overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/3 rounded-full blur-xl pointer-events-none group-hover:bg-pink-500/8 transition-colors" />
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover:bg-pink-500/20 transition-all shadow-inner">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">Multi-Tenant Port Isolation</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Manage administrators, client-side portals, and public embeds through secure, distinct routing gates.
              </p>
            </div>
          </div>
        </section>

        {/* Integration Code Blocks */}
        <section id="integration" className="max-w-7xl mx-auto px-6 py-28 border-t border-slate-900">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-left">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">One Line of Script. <br />Instant Integration.</h2>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-medium">
                Copy the floating chat widget code directly from your settings console. Paste it in your website template to spin up our AI assistant instantly.
              </p>
              <div className="space-y-3 font-semibold text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-400 font-bold">✓</span> No complex library bundles
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-indigo-400 font-bold">✓</span> Custom CSS styling options
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-indigo-400 font-bold">✓</span> Auto-fallback contact channels
                </div>
              </div>
            </div>

            {/* Terminal Embed Box */}
            <div className="bg-slate-950/75 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl relative group">
              {/* Terminal Title Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-900 text-xs text-slate-500 font-semibold font-mono">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
                </div>
                <span className="text-slate-400">widget-embed.html</span>
                <button
                  onClick={handleCopyWidget}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-350 hover:text-white font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedWidget ? (
                    <>
                      <span className="text-emerald-450">✓</span>
                      <span>Copied</span>
                    </>
                  ) : (
                    <span>Copy Code</span>
                  )}
                </button>
              </div>

              {/* Code Pre Area */}
              <div className="p-5 font-mono text-xs text-slate-300 text-left overflow-x-auto space-y-3 leading-relaxed select-all">
                <div>
                  <span className="text-indigo-400/90">{`<!-- Load SupportAgent.ai Widget Config -->`}</span>
                  <pre className="text-slate-300 mt-1 pl-2 border-l border-indigo-900/30">
                    <span className="text-slate-500">&lt;</span><span className="text-indigo-400">script</span><span className="text-slate-500">&gt;</span>{`
  `}window.<span className="text-indigo-300">SupportAgentConfig</span> = {`{`}
    companyId: <span className="text-emerald-400">"your-workspace-hash"</span>,
    origin: <span className="text-emerald-400">"https://supportagent.ai"</span>
  {`};`}
<span className="text-slate-500">&lt;/</span><span className="text-indigo-400">script</span><span className="text-slate-500">&gt;</span>
                  </pre>
                </div>
                <div className="pt-2">
                  <span className="text-indigo-400/90">{`<!-- Include Widget Bundle -->`}</span>
                  <pre className="text-slate-300 mt-1 pl-2 border-l border-indigo-900/30">
                    <span className="text-slate-500">&lt;</span><span className="text-indigo-400">script</span> <span className="text-purple-400">src</span>=<span className="text-emerald-400">"https://supportagent.ai/widget.js"</span> <span className="text-purple-400">async</span><span className="text-slate-500">&gt;&lt;/</span><span className="text-indigo-400">script</span><span className="text-slate-500">&gt;</span>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security / FAQ Section */}
        <section id="security" className="max-w-7xl mx-auto px-6 py-28 border-t border-slate-900">
          <div className="max-w-xl mb-16 space-y-3 text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">Corporate Standards</h2>
            <p className="text-sm sm:text-base text-slate-400 font-semibold leading-relaxed">
              Why developers and operations teams trust SupportAgent.ai.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-slate-900/10 border border-slate-900/80 space-y-2.5 hover:border-indigo-500/10 transition-colors">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">🛡️</span>
                <span>How is data isolation handled?</span>
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Each company tenant is assigned a unique UUID. Document chunks and support messages are strictly indexed under the company's identifier, preventing cross-tenant leakage.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/10 border border-slate-900/80 space-y-2.5 hover:border-indigo-500/10 transition-colors">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">⏱️</span>
                <span>Are API endpoints rate-limited?</span>
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Yes. All public customer endpoints implement strict sliding-window rate limit counters to guard against script abuse and resource exhaustion.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/10 border border-slate-900/80 space-y-2.5 hover:border-indigo-500/10 transition-colors">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">🔏</span>
                <span>Is grounding/RAG context secure?</span>
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Absolutely. Only chunked paragraphs matching the security policy are sent as context to the LLM. Personal Identifiable Information (PII) is automatically filtered out before grounding.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/10 border border-slate-900/80 space-y-2.5 hover:border-indigo-500/10 transition-colors">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">🧑‍💻</span>
                <span>Can we escalate to human agents?</span>
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Yes. SupportAgent.ai supports human escalation fallbacks. If the AI confidence score drops, inquiries are automatically routed to your support email or fallback chat queue.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Corporate Site Footer */}
      <footer className="w-full border-t border-slate-900 bg-[#07080e]/90 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BrandLogo className="h-9 w-9" />
              <span className="text-lg font-extrabold text-white">Invaccs Agent</span>
            </div>
            <p className="text-xs text-slate-450 leading-relaxed font-medium">
              Next-generation multi-tenant client support software powered by grounded vector contextual RAG indexing.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Product Features</h4>
            <div className="flex flex-col gap-2 text-xs text-slate-400 font-semibold">
              <a href="#features" className="hover:text-indigo-400 transition-colors duration-200">Platform Features</a>
              <a href="#integration" className="hover:text-indigo-400 transition-colors duration-200">Widget Embed</a>
              <a href="#security" className="hover:text-indigo-400 transition-colors duration-200">SaaS Security</a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">System Access</h4>
            <div className="flex flex-col gap-2 text-xs text-slate-400 font-semibold">
              <Link href="/login" className="hover:text-indigo-400 transition-colors duration-200">Console Login</Link>
              <Link href="/login" className="hover:text-indigo-400 transition-colors duration-200">Start Free Trial</Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6 border-t border-slate-900/50 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <span>© {new Date().getFullYear()} Invaccs Agent Inc. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

