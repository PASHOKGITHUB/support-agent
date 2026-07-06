'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { api } from '../../services/api';

interface PlanDetails {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  color: string;
  btnStyle: string;
}

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState('Free');
  const [supportEmail, setSupportEmail] = useState('billing@supportagent.ai');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBillingInfo = async () => {
      try {
        setLoading(true);
        const supportData = await api.get('/support');
        if (supportData) {
          setCurrentPlan(supportData.companyPlan || 'Free');
          if (supportData.supportEmail) {
            setSupportEmail(supportData.supportEmail);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load billing metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchBillingInfo();
  }, []);

  const plans: PlanDetails[] = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      description: 'Perfect for prototyping and small personal websites.',
      features: [
        '5 Knowledge base documents',
        '100 Messages per month',
        'Gemini-2.5-flash response model',
        'Basic chat widget embed'
      ],
      color: 'border-slate-200 bg-white text-slate-800',
      btnStyle: 'bg-slate-100 hover:bg-slate-200 text-slate-700'
    },
    {
      name: 'Starter',
      price: '₹2,499',
      period: 'month',
      description: 'Ideal for growing businesses needing grounded support.',
      features: [
        'Up to 50 Knowledge documents',
        '2,000 Messages per month',
        'Priority queue processing',
        'Branded custom widget styling',
        'Email escalation fallback'
      ],
      color: 'border-slate-250 bg-white text-slate-800',
      btnStyle: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
    },
    {
      name: 'Growth',
      price: '₹6,999',
      period: 'month',
      description: 'Built for scaling operations requiring collaboration.',
      features: [
        'Up to 250 Knowledge documents',
        '10,000 Messages per month',
        'Full Team Invitations (RBAC)',
        'Advanced Dashboard Analytics',
        'Custom widget styling & options'
      ],
      color: 'border-indigo-200 bg-indigo-50/30 text-slate-800 ring-2 ring-indigo-600 ring-offset-2',
      btnStyle: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
    },
    {
      name: 'Enterprise',
      price: '₹19,999',
      period: 'month',
      description: 'Tailored for complete operations with heavy traffic.',
      features: [
        'Unlimited Documents & Chunks',
        'Unlimited Messages per month',
        'Dedicated server hosting resources',
        '24/7 Priority support hotline',
        'Weekly AI Analytics Summaries'
      ],
      color: 'border-slate-800 bg-slate-900 text-slate-100',
      btnStyle: 'bg-white hover:bg-slate-100 text-slate-900 shadow-md'
    }
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 pt-24 md:pt-8 overflow-y-auto max-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
            Subscription Plans & Billing
          </h1>
          <p className="text-slate-550 text-sm mt-1">
            Choose the workspace plan that best fits your business needs. Upgrade manually with zero-hassle invoicing.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-650 text-xs flex items-center gap-2 mb-6 max-w-5xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
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
          <div className="space-y-10 max-w-6xl">
            {/* Current plan card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest">Active Workspace Plan</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-2xl font-extrabold text-slate-800">{currentPlan} Plan</h2>
                  <span className="text-xs text-slate-500 font-medium">Active</span>
                </div>
                <p className="text-slate-500 text-xs">
                  Your tenant environment limits and billing rates are assigned to this subscription tier.
                </p>
              </div>
              <div className="px-6 py-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center gap-3">
                <span className="text-xl">💳</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Rupee-denominated Billing</h4>
                  <p className="text-[10px] text-slate-500">Invoices are emailed monthly in INR</p>
                </div>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => {
                const isActive = plan.name.toLowerCase() === currentPlan.toLowerCase();
                return (
                  <div key={plan.name} className={`relative p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${plan.color}`}>
                    {isActive && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white rounded-full text-[9px] font-bold tracking-wider uppercase">
                        Current Active
                      </span>
                    )}

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-extrabold">{plan.name}</h3>
                        <p className="text-[10px] opacity-70 mt-1 leading-normal min-h-[40px]">{plan.description}</p>
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold">{plan.price}</span>
                        <span className="text-[10px] opacity-75 font-semibold">/ {plan.period}</span>
                      </div>

                      <ul className="space-y-2 pt-2 border-t border-slate-100/50 text-[10px] leading-normal font-semibold">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-500 shrink-0">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6">
                      <a
                        href={`mailto:${supportEmail}?subject=Upgrade Request: ${plan.name} Plan`}
                        className={`w-full block text-center py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${plan.btnStyle}`}
                      >
                        {isActive ? 'Manage Subscription' : `Select ${plan.name}`}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Instruction Notice Box */}
            <div className="p-8 rounded-3xl bg-indigo-900 text-white shadow-lg shadow-indigo-900/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2 max-w-xl">
                <h3 className="text-lg font-bold">Need to upgrade or request a customized plan?</h3>
                <p className="text-indigo-200 text-xs leading-relaxed">
                  We offer manually provisioned subscription plans in Rupees to align with corporate accounts. Simply email our support desk and our account managers will contact you within 24 hours.
                </p>
              </div>
              <a
                href={`mailto:${supportEmail}?subject=Requesting SaaS Plan Upgrade`}
                className="px-6 py-3 bg-white text-indigo-900 font-bold hover:bg-slate-100 rounded-xl text-xs transition-colors shrink-0 shadow-md shadow-white/5"
              >
                ✉ Contact Account Desk
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
