'use client';

import React, { useState } from 'react';
import FileUpload from './components/FileUpload';

export default function Home() {
  const [results, setResults] = useState<any>(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-8 md:p-24">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-4">
            ReconCloud
          </h1>
          <p className="text-gray-500 text-lg">Intelligent Bank Reconciliation for Thai Businesses</p>
        </header>

        {!results ? (
          <FileUpload onResults={setResults} />
        ) : (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Match Rate', value: `${results.stats.matchRate.toFixed(1)}%`, color: 'text-pink-400' },
                { label: 'Matched', value: results.stats.matchCount, color: 'text-green-400' },
                { label: 'Unmatched Bank', value: results.unmatchedBank.length, color: 'text-orange-400' },
                { label: 'Unmatched Ledger', value: results.unmatchedLedger.length, color: 'text-purple-400' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-pink-50 shadow-sm">
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Detailed Tables */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-pink-50 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-pink-50 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-700">Reconciliation Breakdown</h3>
                <button 
                  onClick={() => setResults(null)}
                  className="text-sm font-medium text-pink-400 hover:text-pink-500 transition-colors"
                >
                  ← Upload New Files
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-pink-50/50 text-gray-600 text-sm uppercase">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Amount (THB)</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-50">
                    {results.matches.map((match: any, i: number) => (
                      <tr key={`match-${i}`} className="hover:bg-green-50/20 transition-colors">
                        <td className="px-6 py-4 text-gray-600 text-sm">{new Date(match.bank.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-gray-700 font-medium">{match.bank.description}</td>
                        <td className="px-6 py-4 text-green-500 font-bold">฿{match.bank.amount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-bold uppercase">Matched</span>
                        </td>
                      </tr>
                    ))}
                    {results.unmatchedBank.map((tx: any, i: number) => (
                      <tr key={`umb-${i}`} className="hover:bg-orange-50/20 transition-colors">
                        <td className="px-6 py-4 text-gray-600 text-sm">{new Date(tx.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-gray-700 font-medium">{tx.description} (Bank)</td>
                        <td className="px-6 py-4 text-orange-500 font-bold">฿{tx.amount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold uppercase">Unmatched</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
