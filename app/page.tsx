'use client';

import React, { useState } from 'react';
import FileUpload from './components/FileUpload';

export default function Home() {
  const [results, setResults] = useState<any>(null);

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#171717] selection:bg-pink-100">
      <div className="max-w-[1200px] mx-auto px-6 py-12 md:py-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-20">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">System Active</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-black italic">
              Recon<span className="text-gray-400 not-italic">Cloud</span>
            </h1>
            <p className="mt-3 text-gray-500 font-light text-lg tracking-tight max-w-md leading-relaxed">
              Precision bank reconciliation for modern Thai enterprises. 
              Upload, analyze, and resolve in seconds.
            </p>
          </div>
          {results && (
            <button 
              onClick={() => setResults(null)}
              className="group flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-black transition-all duration-300"
            >
              <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
              Start New Session
            </button>
          )}
        </header>

        {!results ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
            <FileUpload onResults={setResults} />
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
            {/* Minimal Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100 border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              {[
                { label: 'Match Rate', value: `${results.stats.matchRate.toFixed(1)}%`, color: 'text-pink-500' },
                { label: 'Successful Matches', value: results.stats.matchCount, color: 'text-black' },
                { label: 'Pending Bank', value: results.unmatchedBank.length, color: 'text-gray-400' },
                { label: 'Pending Ledger', value: results.unmatchedLedger.length, color: 'text-gray-400' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-8 group hover:bg-gray-50/50 transition-colors duration-500">
                  <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-400 mb-2">{stat.label}</p>
                  <p className={`text-4xl font-light tracking-tighter ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Clean Data Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-tight text-gray-900">Transaction Registry</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Matched</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Exception</span>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-gray-400 font-bold border-b border-gray-50 bg-gray-50/30">
                      <th className="px-8 py-4 font-bold">Transaction Date</th>
                      <th className="px-8 py-4 font-bold">Entity Details</th>
                      <th className="px-8 py-4 font-bold text-right">Value (THB)</th>
                      <th className="px-8 py-4 text-center font-bold">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {results.matches.map((match: any, i: number) => (
                      <tr key={`match-${i}`} className="group hover:bg-gray-50/50 transition-colors duration-300">
                        <td className="px-8 py-5 text-sm text-gray-400 font-light">
                          {new Date(match.bank.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-sm font-medium text-gray-900">{match.bank.description}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 tracking-tight">System Reference: #{match.bank.id.slice(0, 8)}</p>
                        </td>
                        <td className="px-8 py-5 text-sm font-medium text-right text-gray-900 tracking-tight">
                          ฿{match.bank.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex justify-center">
                            <span className="px-2.5 py-1 rounded-md bg-pink-50 text-pink-500 text-[10px] font-bold uppercase tracking-wider">Verified</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {results.unmatchedBank.map((tx: any, i: number) => (
                      <tr key={`umb-${i}`} className="group hover:bg-gray-50/50 transition-colors duration-300">
                        <td className="px-8 py-5 text-sm text-gray-400 font-light">
                          {new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                          <p className="text-[10px] text-pink-400 mt-0.5 tracking-tight font-medium italic">Unresolved Bank Entry</p>
                        </td>
                        <td className="px-8 py-5 text-sm font-medium text-right text-gray-900 tracking-tight">
                          ฿{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex justify-center">
                            <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider italic">Exception</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <footer className="text-center pb-12">
              <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.3em]">Precision-Engineered Reconciliation</p>
            </footer>
          </div>
        )}
      </div>
    </main>
  );
}
