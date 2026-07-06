'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import DotField from '../components/DotField';
import { BrandLogo } from '../components/BrandLogo';

export default function LandingPage() {
  const { user } = useAuth();

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
              <span className="text-base font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
                SupportAgent.ai
              </span>
              <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Enterprise SaaS Platform</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400">
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
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-400 tracking-wide uppercase">
            <span>⚡ VERSION 2.5 STABLE RELEASE</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.05] max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-100 to-slate-400">
            Automate Customer Support <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-indigo-350 to-purple-400">
              Grounded on Your Knowledge Base
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed font-medium">
            Deploy self-healing support widgets trained instantly on your company docs. Let AI resolve customer inquiries securely without hallucinations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-xs pt-4">
            <Link
              href="/login"
              className="px-6 py-3.5 bg-white text-slate-950 hover:bg-slate-100 font-extrabold rounded-xl text-xs transition-all shadow-lg hover:-translate-y-0.5 cursor-pointer text-center"
            >
              Start Free Trial
            </Link>
            <a
              href="#features"
              className="px-6 py-3.5 bg-slate-900/50 hover:bg-slate-900 text-slate-300 font-bold rounded-xl text-xs transition-all border border-slate-800 backdrop-blur-sm hover:-translate-y-0.5 cursor-pointer text-center"
            >
              See How It Works
            </a>
          </div>

          {/* Interactive Interface Preview */}
          <div className="w-full max-w-5xl mt-16 p-3 bg-slate-900/30 border border-slate-800/80 rounded-3xl backdrop-blur-sm shadow-2xl relative">
            <div className="absolute inset-0 bg-indigo-500/5 blur-xl rounded-3xl pointer-events-none" />
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 text-[10px] text-slate-500 font-semibold font-mono">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
              </div>
              <span>supportagent-console-mockup.tsx</span>
              <span className="opacity-0">___</span>
            </div>
            
            {/* Mock Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 text-left font-sans">
              <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Vector Documents</span>
                <div className="text-xl font-extrabold text-white">124 Indexed</div>
                <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full w-[80%] bg-indigo-500 rounded-full" />
                </div>
              </div>
              <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Support Conversations</span>
                <div className="text-xl font-extrabold text-white">4,892 Handled</div>
                <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full w-[95%] bg-purple-500 rounded-full" />
                </div>
              </div>
              <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Avg Response Time</span>
                <div className="text-xl font-extrabold text-white">0.45 Seconds</div>
                <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full w-[60%] bg-pink-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-28 border-t border-slate-900">
          <div className="max-w-xl mb-16 space-y-3">
            <h2 className="text-3xl font-black text-white leading-tight">Built for Enterprise Isolation</h2>
            <p className="text-xs text-slate-450 font-semibold leading-relaxed">
              We separate tenant indexes, databases, and configuration settings completely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-slate-900/20 border border-slate-900 hover:border-indigo-500/20 rounded-3xl transition-all space-y-4">
              <span className="text-2xl">⚡</span>
              <h3 className="text-sm font-bold text-white">Retrieval-Augmented Generation (RAG)</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Chunk files dynamically. Context queries inject only relevant paragraphs into the LLM context to block hallucination cycles.
              </p>
            </div>

            <div className="p-8 bg-slate-900/20 border border-slate-900 hover:border-indigo-500/20 rounded-3xl transition-all space-y-4">
              <span className="text-2xl">🔒</span>
              <h3 className="text-sm font-bold text-white">Role-Based Access Control (RBAC)</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Enforce controls at the database level. Lock critical configs under Admin oversight while letting Agents respond to tickets.
              </p>
            </div>

            <div className="p-8 bg-slate-900/20 border border-slate-900 hover:border-indigo-500/20 rounded-3xl transition-all space-y-4">
              <span className="text-2xl">🛰️</span>
              <h3 className="text-sm font-bold text-white">Multi-Tenant Port Isolation</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Manage administrators, client-side portals, and public embeds through secure, distinct routing gates.
              </p>
            </div>
          </div>
        </section>

        {/* Integration Code Blocks */}
        <section id="integration" className="max-w-7xl mx-auto px-6 py-28 border-t border-slate-900">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-white leading-tight">One Line of Script. <br />Instant Integration.</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Copy the floating chat widget code directly from your settings console. Paste it in your website template to spin up our AI assistant instantly.
              </p>
              <div className="space-y-3 font-semibold text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-400">✓</span> No complex library bundles
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-indigo-400">✓</span> Custom CSS styling options
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-indigo-400">✓</span> Auto-fallback contact channels
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-950/70 border border-slate-900 rounded-3xl font-mono text-[10px] text-slate-350 overflow-x-auto space-y-3 leading-relaxed shadow-xl">
              <div className="text-slate-500 pb-2 border-b border-slate-900">widget-embed.html</div>
              <span className="text-indigo-400">{`<!-- Load SupportAgent.ai Widget Config -->`}</span>
              <pre className="text-slate-300">
{`<script>
  window.SupportAgentConfig = {
    companyId: "your-workspace-hash",
    origin: "https://supportagent.ai"
  };
</script>`}
              </pre>
              <span className="text-indigo-400">{`<!-- Include Widget Bundle -->`}</span>
              <pre className="text-slate-300">
{`<script src="https://supportagent.ai/widget.js" async></script>`}
              </pre>
            </div>
          </div>
        </section>

        {/* Security / FAQ Section */}
        <section id="security" className="max-w-7xl mx-auto px-6 py-28 border-t border-slate-900">
          <div className="max-w-xl mb-16 space-y-3">
            <h2 className="text-3xl font-black text-white leading-tight">Corporate Standards</h2>
            <p className="text-xs text-slate-450 font-semibold leading-relaxed">
              Why developers and operations teams trust SupportAgent.ai.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white">How is data isolation handled?</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Each company tenant is assigned a unique UUID. Document chunks and support messages are strictly indexed under the company's identifier, preventing cross-tenant leakage.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white">Are API endpoints rate-limited?</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Yes. All public customer endpoints implement strict sliding-window rate limit counters to guard against script abuse and resource exhaustion.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Corporate Site Footer */}
      <footer className="w-full border-t border-slate-900 bg-[#07080e]/80 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BrandLogo className="h-9 w-9" />
              <span className="text-base font-extrabold text-white">SupportAgent.ai</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              Next-generation multi-tenant client support software powered by grounded vector contextual RAG indexing.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Product Features</h4>
            <div className="flex flex-col gap-2 text-[10px] text-slate-500 font-semibold">
              <a href="#features" className="hover:text-slate-350">Platform Features</a>
              <a href="#integration" className="hover:text-slate-350">Widget Embed</a>
              <a href="#security" className="hover:text-slate-350">SaaS Security</a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">System Access</h4>
            <div className="flex flex-col gap-2 text-[10px] text-slate-500 font-semibold">
              <Link href="/login" className="hover:text-slate-350">Console Login</Link>
              <Link href="/login" className="hover:text-slate-350">Start Free Trial</Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6 border-t border-slate-900/50 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 gap-4">
          <span>© {new Date().getFullYear()} SupportAgent.ai Inc. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
