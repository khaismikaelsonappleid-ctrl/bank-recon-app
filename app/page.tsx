'use client';

import React, { useState, useMemo } from 'react';
import FileUpload from './components/FileUpload';

export default function Home() {
  const [results, setResults] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'mismatches'>('all');

  const processedData = useMemo(() => {
    if (!results) return [];
    if (filter === 'mismatches') {
      return [...results.unmatchedBank.map((b: any) => ({ ...b, type: 'Bank Unmatched' })), 
              ...results.unmatchedLedger.map((l: any) => ({ ...l, type: 'Ledger Unmatched' }))];
    }
    return results.matches.map((m: any) => ({ ...m.bank, type: 'Match', ledger: m.ledger }));
  }, [results, filter]);

  const exportReport = () => {
      console.log("Exporting report...");
  };

  return (
    <main className="min-h-screen bg-[#FDFCFB] text-[#2D2E2E] font-sans p-8">
      {!results ? (
        <FileUpload onResults={setResults} />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <p className="text-xs text-slate-400 font-bold uppercase">Processed</p>
                  <p className="text-2xl font-bold">{results.stats.totalBank}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <p className="text-xs text-slate-400 font-bold uppercase">Verified</p>
                  <p className="text-2xl font-bold">{results.stats.matchCount}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <p className="text-xs text-slate-400 font-bold uppercase">Match Rate</p>
                  <p className="text-2xl font-bold">{results.stats.matchRate.toFixed(1)}%</p>
              </div>
          </div>
          <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border">
            <div className="flex justify-between p-4 border-b">
              <div className="flex gap-2">
                  <button onClick={() => setFilter('all')} className={`px-3 py-1 text-xs font-bold uppercase rounded border ${filter === 'all' ? 'bg-indigo-50' : ''}`}>All</button>
                  <button onClick={() => setFilter('mismatches')} className={`px-3 py-1 text-xs font-bold uppercase rounded border ${filter === 'mismatches' ? 'bg-indigo-50' : ''}`}>Mismatches</button>
              </div>
              <button onClick={exportReport} className="px-3 py-1 text-xs font-bold uppercase rounded border">Export Report</button>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {processedData.map((row: any, i: number) => (
                  <tr key={i} className="border-b hover:bg-slate-50">
                    <td className="px-6 py-4">{new Date(row.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{row.description}</td>
                    <td className="px-6 py-4">{row.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">{row.type}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button className="text-indigo-500 font-bold">Match</button>
                      <button className="text-slate-400 font-bold">Ignore</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
