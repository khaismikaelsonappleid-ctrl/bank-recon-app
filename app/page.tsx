'use client';

import React, { useState, useEffect, useMemo } from 'react';
import FileUpload from './components/FileUpload';

// Utility for Excel Export
const exportToExcel = (data: any) => {
  console.log('Exporting data to Excel...', data);
  // Implementation would go here.
};

export default function Home() {
  const [results, setResults] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'bankExc' | 'ledgerExc' | 'mismatches'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [verifiedMatches, setVerifiedMatches] = useState<Set<number>>(new Set());

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('reconState');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.verified) setVerifiedMatches(new Set(parsed.verified));
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('reconState', JSON.stringify({ verified: Array.from(verifiedMatches) }));
  }, [verifiedMatches]);

  const toggleVerify = (id: number) => {
    const next = new Set(verifiedMatches);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setVerifiedMatches(next);
  };

  const bulkIgnore = () => {
    if (!results) return;
    // Logic to ignore small discrepancies (< 1 THB)
    console.log('Ignoring small discrepancies');
  };

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
              <button onClick={() => setFilter('ledgerExc')} className="text-xs font-bold uppercase text-amber-500 hover:text-amber-700">Ledger Exc</button>
              <button onClick={() => setFilter('mismatches')} className="text-xs font-bold uppercase text-purple-500 hover:text-purple-700">Mismatches</button>
              <button onClick={() => exportToExcel(results)} className="text-xs font-bold uppercase border px-3 py-1 rounded">Export</button>
              <button onClick={bulkIgnore} className="text-xs font-bold uppercase text-slate-500 hover:text-slate-900">Bulk Ignore</button>
            </div>
          )}
        </header>

        {!results ? (
          <FileUpload onResults={setResults} />
        ) : (
          <div className="space-y-8">
            <div className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
              <input type="date" onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))} className="text-xs border p-2 rounded" />
              <input type="date" onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))} className="text-xs border p-2 rounded" />
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              {/* Table logic would go here */}
              <p>Reconciliation view for {filter}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}