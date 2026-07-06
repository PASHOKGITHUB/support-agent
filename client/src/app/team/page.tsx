'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'viewer';
  createdAt: string;
}

export default function TeamSettingsPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'agent' | 'viewer'>('agent');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await api.get('/team');
      setMembers(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch team members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (user.role === 'superadmin') {
        setLoading(false);
      } else {
        fetchMembers();
      }
    }
  }, [user]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await api.post('/team', { name, email, password, role });
      setSuccess('Team member invited successfully.');
      setName('');
      setEmail('');
      setPassword('');
      setRole('agent');
      fetchMembers();
    } catch (err) {
      setError((err as Error).message || 'Failed to add team member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (!isAdmin) return;
    setError('');
    setSuccess('');

    try {
      await api.post(`/team/${memberId}/role`, { role: newRole }); // Wait, is it post or put? Let's check teamRoutes.ts.
      // Wait, in teamRoutes.ts we mounted router.put('/:id/role', updateTeamMemberRole).
      // So let's write api.put! Wait, is there a PUT method in api.ts?
      // Let's check services/api.ts. It has get, post, delete, upload. It does NOT have a put method!
      // Ah! Good catch! Since api.ts does not have put, we can either add a put method to api.ts, or make our team endpoint POST or let teamRoutes support POST for role change!
      // Let's check teamRoutes.ts:
      // router.put('/:id/role', updateTeamMemberRole);
      // Wait, let's just make it POST in teamRoutes.ts or let's use api.post in teamRoutes.ts, or modify teamRoutes.ts to use POST, or add a put method to api.ts.
      // Modifying teamRoutes.ts to use PUT and adding a PUT method to api.ts is very clean.
      // Wait! Let's check what is easiest and most robust. Adding a PUT method to api.ts takes only a few lines, or we can just change teamRoutes.ts to use POST for role update, OR we can just add a PUT helper in team controller!
      // Let's check teamRoutes.ts. We wrote:
      // router.put('/:id/role', updateTeamMemberRole as any);
      // Let's add the put method to `client/src/services/api.ts` so it is fully complete and compliant!
    } catch (e) {
      console.error(e);
    }
  };

  const changeRole = async (memberId: string, newRole: string) => {
    if (!isAdmin) return;
    setError('');
    setSuccess('');

    try {
      await api.put(`/team/${memberId}/role`, { role: newRole });
      setSuccess('Member role updated successfully.');
      fetchMembers();
    } catch (err) {
      setError((err as Error).message || 'Failed to update member role.');
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!isAdmin) return;
    if (!window.confirm('Are you sure you want to remove this team member?')) return;

    setError('');
    setSuccess('');

    try {
      await api.delete(`/team/${memberId}`);
      setSuccess('Team member removed successfully.');
      fetchMembers();
    } catch (err) {
      setError((err as Error).message || 'Failed to remove team member.');
    }
  };

  if (user?.role === 'superadmin') {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-800">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 pt-24 md:pt-8 flex items-center justify-center">
          <div className="max-w-md p-6 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
            <span className="text-3xl">🛡️</span>
            <h2 className="text-lg font-bold text-slate-800">Super Admin Workspace</h2>
            <p className="text-slate-550 text-xs leading-relaxed">
              As a Super Admin, you oversee all companies and do not belong to a single company workspace. Use the Master Panel to manage teams across tenants.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 pt-24 md:pt-8 overflow-y-auto max-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
            Team Workspace & Roles (RBAC)
          </h1>
          <p className="text-slate-550 text-sm mt-1">
            Invite colleagues and manage their access privileges. Permissions are strictly enforced based on roles.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-650 text-xs flex items-center gap-2 mb-6 max-w-4xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-650 text-xs flex items-center gap-2 mb-6 max-w-4xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl">
          {/* Add Team Member Column */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-800">Add Team Member</h2>
              
              {!isAdmin ? (
                <p className="text-amber-650 bg-amber-50 border border-amber-200 rounded-xl p-3 text-[10px] leading-normal font-semibold">
                  ⚠️ View-only access: Only company Admins can add or remove team members.
                </p>
              ) : (
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@company.com"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Initial Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Access Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                    >
                      <option value="admin">Admin (Full Control)</option>
                      <option value="agent">Agent (Chat & View)</option>
                      <option value="viewer">Viewer (Read Only)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:from-indigo-500 hover:to-purple-500 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Members List Table Column */}
          <div className="lg:col-span-2">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <h2 className="text-base font-bold text-slate-800 mb-4">Workspace Directory</h2>

              {loading ? (
                <div className="py-12 flex justify-center">
                  <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : members.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  No registered members found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-2">Member</th>
                        <th className="py-3 px-2">Role</th>
                        {isAdmin && <th className="py-3 px-2 text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {members.map((m) => {
                        const isSelf = m._id === user?.id;
                        return (
                          <tr key={m._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-2">
                              <div>
                                <p className="font-bold text-slate-800">{m.name} {isSelf && <span className="text-[10px] text-indigo-500 bg-indigo-50 px-1.5 py-0.2 rounded ml-1 font-semibold">You</span>}</p>
                                <p className="text-slate-500 text-[10px]">{m.email}</p>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              {isSelf || !isAdmin ? (
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${m.role === 'admin' ? 'bg-indigo-50 text-indigo-650' : m.role === 'agent' ? 'bg-emerald-50 text-emerald-650' : 'bg-slate-100 text-slate-600'}`}>
                                  {m.role}
                                </span>
                              ) : (
                                <select
                                  value={m.role}
                                  onChange={(e) => changeRole(m._id, e.target.value)}
                                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:border-indigo-600 text-[10px]"
                                >
                                  <option value="admin">Admin</option>
                                  <option value="agent">Agent</option>
                                  <option value="viewer">Viewer</option>
                                </select>
                              )}
                            </td>
                            {isAdmin && (
                              <td className="py-3 px-2 text-right">
                                {!isSelf && (
                                  <button
                                    onClick={() => handleDeleteMember(m._id)}
                                    className="p-1 text-slate-400 hover:text-red-650 transition-colors cursor-pointer"
                                    title="Remove team member"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
