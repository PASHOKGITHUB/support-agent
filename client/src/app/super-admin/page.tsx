'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface CompanyRecord {
  _id: string;
  name: string;
  isActive: boolean;
  plan: 'Free' | 'Starter' | 'Growth' | 'Enterprise';
  createdAt: string;
  usersCount: number;
  docsCount: number;
  chatsCount: number;
  apiRequestsCount: number;
}

interface GlobalMetrics {
  totalCompanies: number;
  totalUsers: number;
  totalChats: number;
  totalDocs: number;
  totalApiRequests: number;
  apiRequestsBreakdown: { companyName: string; count: number }[];
  docProcessedBreakdown: { companyName: string; count: number }[];
}

export default function SuperAdminPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [metrics, setMetrics] = useState<GlobalMetrics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSuperAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      // Fetch companies
      const companiesRes = await fetch(`${API_URL}/super-admin/companies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!companiesRes.ok) throw new Error('Failed to load companies database.');
      const companiesData = await companiesRes.json();
      setCompanies(companiesData);

      // Fetch metrics
      const metricsRes = await fetch(`${API_URL}/super-admin/metrics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!metricsRes.ok) throw new Error('Failed to load global metrics data.');
      const metricsData = await metricsRes.json();
      setMetrics(metricsData);

    } catch (err) {
      console.error(err);
      setError((err as Error).message || 'Server error loading administration dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'superadmin') {
      fetchSuperAdminData();
    } else {
      setError('Unauthorized access. Super Admin permissions required.');
      setLoading(false);
    }
  }, [user]);

  const handleToggleActive = async (companyId: string) => {
    try {
      setError('');
      setSuccess('');
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const res = await fetch(`${API_URL}/super-admin/companies/${companyId}/toggle`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to update company active status.');
      const data = await res.json();
      setSuccess(data.message);
      
      // Refresh database records
      const updatedCompanies = companies.map(c => 
        c._id === companyId ? { ...c, isActive: !c.isActive } : c
      );
      setCompanies(updatedCompanies);
      
    } catch (err) {
      setError((err as Error).message || 'Error toggling account status.');
    }
  };

  const handlePlanChange = async (companyId: string, newPlan: string) => {
    try {
      setError('');
      setSuccess('');
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const res = await fetch(`${API_URL}/super-admin/companies/${companyId}/plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan: newPlan })
      });

      if (!res.ok) throw new Error('Failed to update subscription tier.');
      const data = await res.json();
      setSuccess(data.message);
      
      // Update local state
      const updatedCompanies = companies.map(c => 
        c._id === companyId ? { ...c, plan: newPlan as any } : c
      );
      setCompanies(updatedCompanies);

    } catch (err) {
      setError((err as Error).message || 'Error updating subscription plan.');
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (user?.role !== 'superadmin') {
    return (
      <div className="flex min-h-screen bg-slate-50 text-slate-800">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="max-w-md p-6 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
            <span className="text-3xl">🚫</span>
            <h2 className="text-lg font-bold text-slate-800">Access Denied</h2>
            <p className="text-slate-500 text-xs">
              You must be logged in as a Super Admin / SaaS Owner to view this master dashboard.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
            SaaS Master Administration
          </h1>
          <p className="text-slate-550 text-sm mt-1">
            Global system statistics, tenant subscriptions, account suspensions, and overall LLM API usage.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-650 text-xs flex items-center gap-2 mb-6 max-w-6xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-650 text-xs flex items-center gap-2 mb-6 max-w-6xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{success}</span>
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
          <div className="space-y-8 max-w-6xl">
            {/* Global Metrics Grid */}
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Companies</span>
                  <p className="text-2xl font-extrabold text-slate-800 mt-1">{metrics.totalCompanies}</p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Users</span>
                  <p className="text-2xl font-extrabold text-slate-800 mt-1">{metrics.totalUsers}</p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Documents</span>
                  <p className="text-2xl font-extrabold text-slate-800 mt-1">{metrics.totalDocs}</p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Chats</span>
                  <p className="text-2xl font-extrabold text-slate-800 mt-1">{metrics.totalChats}</p>
                </div>
                <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-150 shadow-sm">
                  <span className="text-indigo-500 text-[10px] font-bold uppercase tracking-wider">Total API Requests</span>
                  <p className="text-2xl font-extrabold text-indigo-700 mt-1">{metrics.totalApiRequests}</p>
                </div>
              </div>
            )}

            {/* API Usage Breakdown (SVG Bar Chart) */}
            {metrics && metrics.apiRequestsBreakdown.length > 0 && (
              <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
                <h2 className="text-sm font-bold text-slate-800 mb-6">LLM API Usage (Messages Streamed per Company)</h2>
                <div className="space-y-4">
                  {metrics.apiRequestsBreakdown.map((item, idx) => {
                    const maxVal = Math.max(...metrics.apiRequestsBreakdown.map(i => i.count), 1);
                    const percentage = (item.count / maxVal) * 100;
                    return (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex justify-between items-center font-semibold text-slate-700">
                          <span>{item.companyName}</span>
                          <span>{item.count} messages</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Companies Management Database */}
            <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <h2 className="text-base font-bold text-slate-800">Workspace Database Manager</h2>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search companies by name..."
                  className="px-4 py-2 border border-slate-200 bg-slate-50 text-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 max-w-xs w-full"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-3">Company</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Pricing Plan</th>
                      <th className="py-3 px-3 text-center">Users</th>
                      <th className="py-3 px-3 text-center">Docs</th>
                      <th className="py-3 px-3 text-center">Chats</th>
                      <th className="py-3 px-3 text-center">API Calls</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredCompanies.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-3">
                          <div>
                            <p className="font-extrabold text-slate-800">{c.name}</p>
                            <p className="text-[9px] text-slate-400">ID: {c._id}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${c.isActive ? 'bg-emerald-50 text-emerald-650' : 'bg-red-50 text-red-650'}`}>
                            {c.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <select
                            value={c.plan}
                            onChange={(e) => handlePlanChange(c._id, e.target.value)}
                            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:border-indigo-650 text-[10px]"
                          >
                            <option value="Free">Free</option>
                            <option value="Starter">Starter</option>
                            <option value="Growth">Growth</option>
                            <option value="Enterprise">Enterprise</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-3 text-center font-bold text-slate-600">{c.usersCount}</td>
                        <td className="py-3.5 px-3 text-center font-bold text-slate-600">{c.docsCount}</td>
                        <td className="py-3.5 px-3 text-center font-bold text-slate-600">{c.chatsCount}</td>
                        <td className="py-3.5 px-3 text-center font-bold text-indigo-650">{c.apiRequestsCount}</td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => handleToggleActive(c._id)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-sm ${c.isActive ? 'bg-red-50 hover:bg-red-100 text-red-650' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-650'}`}
                          >
                            {c.isActive ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
