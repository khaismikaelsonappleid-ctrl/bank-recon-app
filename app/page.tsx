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
    <main className="min-h-screen bg-[#FDFCFB] text-[#2D2E2E] selection:bg-indigo-100/50">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[80%] md:w-[40%] h-[40%] rounded-full bg-purple-50/50 blur-[80px] md:blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[60%] md:w-[30%] h-[30%] rounded-full bg-blue-50/40 blur-[70px] md:blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[70%] md:w-[35%] h-[35%] rounded-full bg-emerald-50/30 blur-[80px] md:blur-[110px]" />
      </div>

      <div className="relative max-w-[1100px] mx-auto px-6 md:px-8 py-12 md:py-24">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-20">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-100 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-500">Reconciliation Engine v2.0</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
              Clear<span className="text-slate-400 font-light">Ledger</span>
            </h1>
            <p className="text-base md:text-lg text-slate-500 font-light max-w-md leading-relaxed">
              Automated financial matching with artisan precision. Upload your statements to begin.
            </p>
          </div>
          
          {results && (
            <button 
              onClick={() => setResults(null)}
              className="flex items-center justify-center gap-2 px-5 py-3 md:py-2.5 rounded-full bg-white border border-slate-100 text-sm font-medium text-slate-600 hover:text-slate-900 hover:border-slate-200 hover:shadow-sm transition-all duration-300 w-full md:w-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              New Session
            </button>
          )}
        </header>

        {!results ? (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out">
            <FileUpload onResults={setResults} />
          </div>
        ) : (
          <div className="space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000 ease-out">
            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Match Accuracy', value: `${results.stats.matchRate.toFixed(1)}%`, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
                { label: 'Verified Matches', value: results.stats.matchCount, color: 'text-slate-900', bg: 'bg-white' },
                { label: 'Bank Exceptions', value: results.unmatchedBank.length, color: 'text-rose-500', bg: 'bg-rose-50/30' },
                { label: 'Ledger Exceptions', value: results.unmatchedLedger.length, color: 'text-amber-500', bg: 'bg-amber-50/30' },
              ].map((stat, idx) => (
                <div key={idx} className={`${stat.bg} p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-sm transition-transform hover:-translate-y-1 duration-500`}>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2 md:mb-3">{stat.label}</p>
                  <p className={`text-3xl md:text-4xl font-medium tracking-tighter ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Reconciliation Comparison Table */}
            <div className="group bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-700">
              <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Comparative Reconciliation</h3>
                  <p className="text-xs text-slate-400 mt-1">Cross-referencing statements against internal ledgers</p>
                </div>
                <div className="flex gap-2 md:gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider border border-emerald-100/50">
                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                    Matched
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-wider border border-rose-100/50">
                    <div className="w-1 h-1 rounded-full bg-rose-500" />
                    Missing
                  </span>
                </div>
              </div>
              
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold border-b border-slate-50">
                      <th className="pl-6 md:pl-10 pr-4 py-6">Date</th>
                      <th className="px-4 py-6">Bank Description</th>
                      <th className="px-4 py-6 text-right">Amount</th>
                      <th className="px-4 py-6 text-center">Status</th>
                      <th className="pl-4 pr-6 md:pr-10 py-6">Ledger Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {/* Matched Row Style */}
                    {results.matches.map((match: any, i: number) => (
                      <tr key={`match-${i}`} className="group/row hover:bg-slate-50/50 transition-all duration-300">
                        <td className="pl-6 md:pl-10 pr-4 py-6 text-sm text-slate-400 font-light">
                          {formatDate(match.bank.date)}
                        </td>
                        <td className="px-4 py-6">
                          <p className="text-sm font-medium text-slate-800">{match.bank.description}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase tracking-tighter opacity-0 group-hover/row:opacity-100 transition-opacity">ID: {match.bank.id.slice(0, 12)}</p>
                        </td>
                        <td className="px-4 py-6 text-sm font-semibold text-right text-slate-900 whitespace-nowrap">
                          {formatCurrency(match.bank.amount)}
                        </td>
                        <td className="px-4 py-6">
                          <div className="flex justify-center">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        </td>
                        <td className="pl-4 pr-6 md:pr-10 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-800">{match.ledger.description}</span>
                            <span className="text-[10px] text-emerald-500 font-bold mt-1 uppercase tracking-widest">Matched Auto</span>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {/* Unmatched Bank Style */}
                    {results.unmatchedBank.map((tx: any, i: number) => (
                      <tr key={`umb-${i}`} className="bg-rose-50/10 group/row hover:bg-rose-50/20 transition-all duration-300">
                        <td className="pl-6 md:pl-10 pr-4 py-6 text-sm text-slate-400 font-light italic">
                          {formatDate(tx.date)}
                        </td>
                        <td className="px-4 py-6">
                          <p className="text-sm font-medium text-slate-800">{tx.description}</p>
                          <p className="text-[10px] text-rose-400 mt-1 font-bold uppercase tracking-wider">Unresolved Bank Entry</p>
                        </td>
                        <td className="px-4 py-6 text-sm font-semibold text-right text-rose-600 whitespace-nowrap">
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="px-4 py-6">
                          <div className="flex justify-center">
                            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          </div>
                        </td>
                        <td className="pl-4 pr-6 md:pr-10 py-6">
                          <span className="text-xs font-medium text-slate-300 italic">No corresponding ledger entry found</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-50 sm:hidden">
                <p className="text-[10px] text-center text-slate-400 font-medium italic">Swipe horizontally to view full report</p>
              </div>
            </div>

            <footer className="text-center pt-8 md:pt-12 pb-16 md:pb-20">
              <div className="inline-flex items-center gap-4">
                <div className="h-px w-6 md:w-8 bg-slate-100" />
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em] md:tracking-[0.4em]">Designed for Operational Excellence</p>
                <div className="h-px w-6 md:w-8 bg-slate-100" />
              </div>
            </footer>
          </div>
        )}
      </div>
    </main>
  );
}
