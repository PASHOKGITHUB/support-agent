'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { api } from '../../services/api';
import Link from 'next/link';

interface DocumentInfo {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

interface ChatSession {
  _id: string;
  title: string;
  createdAt: string;
  messages: any[];
  feedback?: 'helpful' | 'not_helpful' | null;
}

export default function DashboardPage() {
  const [docs, setDocs] = useState<DocumentInfo[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [supportEmail, setSupportEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Subscription Date States
  const [companyPlan, setCompanyPlan] = useState('Free');
  const [upgradedAt, setUpgradedAt] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [docsData, chatsData, supportData] = await Promise.all([
          api.get('/documents'),
          api.get('/chats'),
          api.get('/support')
        ]);
        setDocs(docsData);
        setChats(chatsData);
        setSupportEmail(supportData.supportEmail);
        setCompanyPlan(supportData.companyPlan || 'Free');
        setUpgradedAt(supportData.upgradedAt || null);
        setExpiresAt(supportData.expiresAt || null);
      } catch (err) {
        setError('Failed to fetch dashboard metrics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalMessages = chats.reduce((sum, c) => sum + (c.messages || []).length, 0);
  const feedbackChats = chats.filter(c => c.feedback);
  const helpfulChatsCount = chats.filter(c => c.feedback === 'helpful').length;
  const satisfactionRate = feedbackChats.length > 0
    ? Math.round((helpfulChatsCount / feedbackChats.length) * 100)
    : 100;

  let daysLeft: number | null = null;
  if (expiresAt) {
    const diff = new Date(expiresAt).getTime() - Date.now();
    daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  const inAppNotifications = [];
  if (companyPlan === 'Free') {
    inAppNotifications.push({
      id: 'plan_free',
      type: 'warning',
      text: 'You are currently on the Free plan. Upgrade to unlock document capacity and custom widget styling.',
      date: new Date().toLocaleDateString()
    });
  } else if (upgradedAt) {
    inAppNotifications.push({
      id: 'plan_upgrade',
      type: 'success',
      text: `Your workspace subscription was upgraded to the ${companyPlan} plan.`,
      date: new Date(upgradedAt).toLocaleDateString()
    });
  }

  if (daysLeft !== null) {
    if (daysLeft <= 0) {
      inAppNotifications.push({
        id: 'plan_expired',
        type: 'error',
        text: `Your ${companyPlan} subscription has expired. Please contact billing.`,
        date: new Date(expiresAt!).toLocaleDateString()
      });
    } else if (daysLeft <= 7) {
      inAppNotifications.push({
        id: 'plan_expiring_soon',
        type: 'warning',
        text: `Your ${companyPlan} subscription expires in ${daysLeft} days. Renewal required.`,
        date: new Date(expiresAt!).toLocaleDateString()
      });
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 pt-24 md:pt-8 overflow-y-auto max-h-screen">
        {/* Top Announcement Bar if Free Plan */}
        {companyPlan === 'Free' && (
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl text-xs font-bold flex justify-between items-center shadow-md shadow-orange-500/5">
            <span>📢 Announcement: You are on the Free Plan. Upgrade your subscription to Starter or Growth to get more storage capacity!</span>
            <Link href="/billing" className="px-3 py-1.5 bg-white text-orange-700 hover:bg-slate-100 rounded-xl font-extrabold transition-colors">
              Upgrade Now
            </Link>
          </div>
        )}

        {/* Subscription Expiration Reminder Banner */}
        {daysLeft !== null && daysLeft <= 7 && (
          <div className="mb-6 p-4 bg-red-600 text-white rounded-2xl text-xs font-bold flex justify-between items-center shadow-md animate-pulse">
            <span>⚠️ Subscription Notice: Your {companyPlan} plan will expire in {daysLeft} {daysLeft === 1 ? 'day' : 'days'} (on {new Date(expiresAt!).toLocaleDateString()}). Please renew to keep your features active!</span>
            <Link href="/billing" className="px-3 py-1.5 bg-white text-red-700 hover:bg-slate-100 rounded-xl font-extrabold transition-colors">
              Renew Now
            </Link>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              Welcome Dashboard
            </h1>
            <p className="text-slate-550 text-sm mt-1">
              Monitor your document-grounded AI support engine activity.
            </p>
          </div>

          {/* In-app Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-2 text-xs font-semibold"
            >
              <span>🔔 Notifications</span>
              {inAppNotifications.length > 0 && (
                <span className="px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold">
                  {inAppNotifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 space-y-3">
                <h3 className="text-xs font-extrabold text-slate-800 pb-2 border-b border-slate-100">In-App Notifications</h3>
                {inAppNotifications.length === 0 ? (
                  <p className="text-[10px] text-slate-400 py-3 text-center">No new notifications</p>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto">
                    {inAppNotifications.map((notif, index) => (
                      <div key={index} className="p-3 bg-slate-50 rounded-xl text-[10px] leading-relaxed border border-slate-100">
                        <div className="flex justify-between font-bold text-slate-500 mb-1">
                          <span className={notif.type === 'error' ? 'text-red-500' : notif.type === 'warning' ? 'text-amber-500' : 'text-emerald-500'}>
                            {notif.type.toUpperCase()}
                          </span>
                          <span>{notif.date}</span>
                        </div>
                        <p className="text-slate-700 font-semibold">{notif.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-650 text-xs flex items-center gap-2 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-24">
            <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Card 1 */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Documents</span>
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-650">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-800 mb-1">{docs.length}</div>
                <p className="text-slate-500 text-xs">Knowledge files processed</p>
              </div>

              {/* Card 2 */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Conversations</span>
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-655">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-800 mb-1">{chats.length}</div>
                <p className="text-slate-550 text-xs">AI Chat sessions logged</p>
              </div>

              {/* Card 3 */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Messages Logged</span>
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-650">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-800 mb-1">{totalMessages}</div>
                <p className="text-slate-500 text-xs">Total inputs & assistant replies</p>
              </div>

              {/* Card 4 */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">CSAT Satisfaction</span>
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-650">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-800 mb-1">{satisfactionRate}%</div>
                <p className="text-slate-500 text-xs">{feedbackChats.length} Ratings submitted</p>
              </div>
            </div>

            {/* Dashboard Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Recent Uploads */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-slate-800">Recent Documents</h2>
                  <Link href="/knowledge-base" className="text-indigo-600 hover:text-indigo-500 text-xs font-semibold">
                    Manage KB
                  </Link>
                </div>
                {docs.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    No documents found in knowledge base.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {docs.slice(0, 5).map((doc) => (
                      <div key={doc._id} className="py-3 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-3 overflow-hidden pr-4">
                          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500">
                            <svg xmlns="http://www.w3.org/2059/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-slate-700 font-bold truncate">{doc.originalName}</span>
                        </div>
                        <span className="text-slate-500 shrink-0">{formatSize(doc.size)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Recent Chats */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-slate-800">Recent Chats</h2>
                  <Link href="/chat" className="text-indigo-600 hover:text-indigo-500 text-xs font-semibold">
                    Launch Assistant
                  </Link>
                </div>
                {chats.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    No active chat history.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {chats.slice(0, 5).map((chat) => (
                      <Link
                        key={chat._id}
                        href={`/chat?id=${chat._id}`}
                        className="py-3.5 flex justify-between items-center hover:bg-slate-50 rounded-xl px-2 -mx-2 transition-all group"
                      >
                        <div className="flex items-center gap-3 overflow-hidden pr-4 text-xs">
                          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 group-hover:text-indigo-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          <span className="text-slate-700 font-bold truncate group-hover:text-indigo-600 transition-colors">
                            {chat.title}
                          </span>
                        </div>
                        <span className="text-slate-500 text-[10px] shrink-0">
                          {new Date(chat.createdAt).toLocaleDateString()}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
