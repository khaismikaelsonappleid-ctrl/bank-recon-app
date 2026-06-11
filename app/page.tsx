'use client';

import React, { useState } from 'react';
import FileUpload from './components/FileUpload';

export default function Home() {
  const [results, setResults] = useState<any>(null);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <main className="min-h-screen bg-[#FDFCFB] text-[#2D2E2E] selection:bg-indigo-100/50 font-sans">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[80%] md:w-[40%] h-[40%] rounded-full bg-purple-50/50 blur-[80px] md:blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[60%] md:w-[30%] h-[30%] rounded-full bg-blue-50/40 blur-[70px] md:blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[70%] md:w-[35%] h-[35%] rounded-full bg-emerald-50/30 blur-[80px] md:blur-[110px]" />
      </div>

      <div className="relative max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {/* Header - More compact */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 md:mb-16">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-slate-100 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-slate-500">System Ready</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
              Clear<span className="text-indigo-400/80 font-light">Ledger</span>
            </h1>
            <p className="text-sm md:text-base text-slate-500 font-light max-w-sm leading-relaxed">
              Premium financial reconciliation with artisan precision.
            </p>
          </div>
          
          {results && (
            <button 
              onClick={() => setResults(null)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-100 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-md transition-all duration-300 w-full md:w-auto active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Start New Analysis
            </button>
          )}
        </header>

        {!results ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <FileUpload onResults={setResults} />
          </div>
        ) : (
          <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            {/* Stats Dashboard - Compact and Premium */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                { label: 'Match Rate', value: `${results.stats.matchRate.toFixed(1)}%`, color: 'text-indigo-600', bg: 'bg-indigo-50/30' },
                { label: 'Verified', value: results.stats.matchCount, color: 'text-slate-900', bg: 'bg-white' },
                { label: 'Bank Exc.', value: results.unmatchedBank.length, color: 'text-rose-500', bg: 'bg-rose-50/20' },
                { label: 'Ledger Exc.', value: results.unmatchedLedger.length, color: 'text-amber-500', bg: 'bg-amber-50/20' },
              ].map((stat, idx) => (
                <div key={idx} className={`${stat.bg} p-5 md:p-6 rounded-3xl border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-sm hover:shadow-lg transition-all duration-500`}>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1.5">{stat.label}</p>
                  <p className={`text-2xl md:text-3xl font-semibold tracking-tight ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Reconciliation Comparison Table */}
            <div className="bg-white/80 backdrop-blur-md rounded-[2rem] border border-slate-100/80 shadow-[0_15px_50px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-500">
              <div className="px-6 md:px-8 py-5 md:py-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Analysis Report</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Automated cross-reference results</p>
                </div>
                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-wider border border-emerald-100/40">
                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                    Verified
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[9px] font-bold uppercase tracking-wider border border-rose-100/40">
                    <div className="w-1 h-1 rounded-full bg-rose-500" />
                    Action Required
                  </span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="text-[9px] uppercase tracking-widest text-slate-400 font-bold border-b border-slate-50/50">
                      <th className="pl-6 md:pl-8 pr-4 py-4">Date</th>
                      <th className="px-4 py-4">Description</th>
                      <th className="px-4 py-4 text-right">Amount</th>
                      <th className="px-4 py-4 text-center">Status</th>
                      <th className="pl-4 pr-6 md:pr-8 py-4">Ref / Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50/50">
                    {results.matches.map((match: any, i: number) => (
                      <tr key={`match-${i}`} className="group hover:bg-indigo-50/10 transition-colors duration-200">
                        <td className="pl-6 md:pl-8 pr-4 py-4 text-xs text-slate-400 font-medium">
                          {formatDate(match.bank.date)}
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-xs font-semibold text-slate-700">{match.bank.description}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">ID: {match.bank.id.slice(0, 8)}</p>
                        </td>
                        <td className="px-4 py-4 text-xs font-bold text-right text-slate-900 tabular-nums">
                          {formatCurrency(match.bank.amount)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-center">
                            <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100/50">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        </td>
                        <td className="pl-4 pr-6 md:pr-8 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-600">{match.ledger.description}</span>
                            <span className="text-[9px] text-emerald-500/80 font-bold mt-0.5 uppercase tracking-widest">Auto-Match</span>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {results.unmatchedBank.map((tx: any, i: number) => (
                      <tr key={`umb-${i}`} className="bg-rose-50/5 hover:bg-rose-50/10 transition-colors duration-200">
                        <td className="pl-6 md:pl-8 pr-4 py-4 text-xs text-slate-400 font-medium italic">
                          {formatDate(tx.date)}
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-xs font-semibold text-slate-700">{tx.description}</p>
                          <p className="text-[9px] text-rose-400 font-bold mt-0.5 uppercase tracking-wider">Unresolved Entry</p>
                        </td>
                        <td className="px-4 py-4 text-xs font-bold text-right text-rose-500 tabular-nums">
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-center">
                            <div className="w-6 h-6 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100/50">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          </div>
                        </td>
                        <td className="pl-4 pr-6 md:pr-8 py-4">
                          <span className="text-[10px] font-medium text-slate-400 italic">No ledger match found</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <footer className="text-center pt-4 pb-12">
              <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.4em]">Designed for Operational Excellence</p>
            </footer>
          </div>
        )}
      </div>
    </main>
  );
}
