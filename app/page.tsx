
'use client';

import React, { useState, useEffect, useMemo } from 'react';
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

  return (
    <main className="min-h-screen bg-[#FDFCFB] text-[#2D2E2E] font-sans p-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold">Clear<span className="text-indigo-400">Ledger</span></h1>
        {results && (
          <div className="flex gap-2">
            <button onClick={() => setFilter('all')} className="px-3 py-1 text-xs font-bold uppercase rounded border">All</button>
            <button onClick={() => setFilter('mismatches')} className="px-3 py-1 text-xs font-bold uppercase rounded border">Mismatches</button>
          </div>
        )}
      </header>

      {!results ? (
        <FileUpload onResults={setResults} />
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Type</th>
              </tr>
            </thead>
            <tbody>
              {processedData.map((row: any, i: number) => (
                <tr key={i} className="border-b hover:bg-slate-50">
                  <td className="px-6 py-4">{new Date(row.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{row.description}</td>
                  <td className="px-6 py-4">{row.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">{row.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
