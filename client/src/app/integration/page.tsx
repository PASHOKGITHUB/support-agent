'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function IntegrationPage() {
  const { user } = useAuth();
  const [hostOrigin, setHostOrigin] = useState('http://localhost:3000');
  const [copiedType, setCopiedType] = useState<'link' | 'iframe' | 'widget' | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostOrigin(window.location.origin);
    }
  }, []);

  const companyId = user?.companyId || '6a4b4e4774d7ea968b227666';
  
  const shareableLink = `${hostOrigin}/embed/chat?companyId=${companyId}`;

  const iframeCode = `<iframe src="${hostOrigin}/embed/chat?companyId=${companyId}" width="100%" height="600" style="border:1px solid #e2e8f0; border-radius:16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" allow="microphone"></iframe>`;

  const widgetCode = `<script>
  window.SupportAgentConfig = {
    companyId: "${companyId}",
    origin: "${hostOrigin}"
  };
</script>
<script src="${hostOrigin}/widget.js" async></script>`;

  const handleCopy = (code: string, type: 'link' | 'iframe' | 'widget') => {
    navigator.clipboard.writeText(code);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
            Share & Embed Chat Assistant
          </h1>
          <p className="text-slate-550 text-sm mt-1">
            Access or embed your document-grounded AI support chatbot on websites, emails, or messages.
          </p>
        </div>

        <div className="max-w-4xl space-y-8">
          {/* Shareable Link */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-3 border-b border-slate-100 gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full mb-1.5 inline-block">
                  Highly Recommended
                </span>
                <h2 className="text-base font-bold text-slate-800">Standalone Shareable Chat Link</h2>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Direct full-screen chat interface. Share this link anywhere, send it to customers, or link it to support emails.
                </p>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <a
                  href={shareableLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer shrink-0"
                >
                  Launch Chat ↗
                </a>
                <button
                  onClick={() => handleCopy(shareableLink, 'link')}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-sm shrink-0"
                >
                  {copiedType === 'link' ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

            <div className="relative">
              <pre className="p-4 bg-slate-900 text-slate-300 rounded-2xl text-xs font-mono overflow-x-auto border border-slate-850 whitespace-pre-wrap select-all leading-relaxed font-semibold">
                {shareableLink}
              </pre>
            </div>
          </div>

          {/* Option 2: Iframe */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-800">Option 2: HTML Iframe Embed</h2>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Best for embedding the support chat inside a dedicated support portal or contact page.
                </p>
              </div>
              <button
                onClick={() => handleCopy(iframeCode, 'iframe')}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-sm"
              >
                {copiedType === 'iframe' ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            <div className="relative">
              <pre className="p-4 bg-slate-900 text-slate-300 rounded-2xl text-xs font-mono overflow-x-auto border border-slate-850 whitespace-pre-wrap select-all leading-relaxed">
                {iframeCode}
              </pre>
            </div>

            <div className="text-[11px] text-slate-500 leading-relaxed space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="font-bold text-slate-700 text-xs mb-1">💡 Integration Steps:</p>
              <p>1. Copy the iframe tag above.</p>
              <p>2. Paste it into your website's HTML editor or dashboard layout builder (e.g. WordPress, Webflow, Shopify).</p>
              <p>3. Set width and height dimensions to fit your page layout.</p>
            </div>
          </div>

          {/* Option 3: Script Tag */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-800">Option 3: Floating Chat Widget Script</h2>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Render a floating chat bubble in the bottom right corner of all pages.
                </p>
              </div>
              <button
                onClick={() => handleCopy(widgetCode, 'widget')}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-sm"
              >
                {copiedType === 'widget' ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            <div className="relative">
              <pre className="p-4 bg-slate-900 text-slate-300 rounded-2xl text-xs font-mono overflow-x-auto border border-slate-850 whitespace-pre-wrap select-all leading-relaxed">
                {widgetCode}
              </pre>
            </div>

            <div className="text-[11px] text-slate-500 leading-relaxed space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="font-bold text-slate-700 text-xs mb-1">💡 Integration Steps:</p>
              <p>1. Copy the script snippets above.</p>
              <p>2. Paste them into the header (`&lt;head&gt;`) or footer section of your main website HTML template.</p>
              <p>3. Once loaded, a chat launcher button will display automatically in the bottom-right corner of your site.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
