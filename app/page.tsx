
'use client';

import React, { useState, useMemo } from 'react';
import FileUpload from './components/FileUpload';

export default function Home() {
  const [results, setResults] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'bankExc'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

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

  const filteredUnmatchedBank = useMemo(() => {
    if (!results) return [];
    return results.unmatchedBank.filter((tx: any) => {
      const txDate = new Date(tx.date);
      const start = dateRange.start ? new Date(dateRange.start) : new Date(0);
      const end = dateRange.end ? new Date(dateRange.end) : new Date();
      return txDate >= start && txDate <= end;
    });
  }, [results, dateRange]);

  return (
    <main className="min-h-screen bg-[#FDFCFB] text-[#2D2E2E] selection:bg-indigo-100/50 font-sans">
      <div className="relative max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="flex items-center justify-between gap-6 mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Clear<span className="text-indigo-400/80 font-light">Ledger</span>
          </h1>
          {results && (
            <div className="flex gap-4">
              <button onClick={() => setFilter('all')} className="text-xs font-bold uppercase hover:text-indigo-600">All</button>
              <button onClick={() => setFilter('bankExc')} className="text-xs font-bold uppercase text-rose-500 hover:text-rose-700">Bank Exc</button>
            </div>
          )}
        </header>

        {!results ? (
          <FileUpload onResults={setResults} />
        ) : (
          <div className="space-y-8">
            {filter === 'bankExc' && (
              <div className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                <input type="date" onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))} className="text-xs border p-2 rounded" />
                <input type="date" onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))} className="text-xs border p-2 rounded" />
              </div>
            )}

            {/* Display list based on filter */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] uppercase tracking-widest text-slate-400 font-bold border-b border-slate-50">
                    <th className="py-4">Date</th>
                    <th className="py-4">Description</th>
                    <th className="py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(filter === 'bankExc' ? filteredUnmatchedBank : results.matches).map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-4 text-xs">{formatDate(item.bank?.date || item.date)}</td>
                      <td className="py-4 text-xs">{item.bank?.description || item.description}</td>
                      <td className="py-4 text-xs text-right">{formatCurrency(item.bank?.amount || item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
