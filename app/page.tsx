
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import FileUpload from './components/FileUpload';

// Utility for Excel Export
const exportToExcel = (data: any) => {
  console.log('Exporting data to Excel...', data);
};

export default function Home() {
  const [results, setResults] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'bankExc' | 'ledgerExc' | 'mismatches'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [verifiedMatches, setVerifiedMatches] = useState<Set<number>>(new Set());

  // Filtered and sorted data
  const processedData = useMemo(() => {
    if (!results) return [];
    let data = results;
    
    // Filtering Logic
    if (dateRange.start) data = data.filter((item: any) => item.date >= dateRange.start);
    if (dateRange.end) data = data.filter((item: any) => item.date <= dateRange.end);
    if (filter !== 'all') data = data.filter((item: any) => item.type === filter);

    // Sorting Logic
    if (sortConfig) {
      data.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [results, dateRange, filter, sortConfig]);

  const toggleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  useEffect(() => {
    const saved = localStorage.getItem('reconState');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.verified) setVerifiedMatches(new Set(parsed.verified));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('reconState', JSON.stringify({ verified: Array.from(verifiedMatches) }));
  }, [verifiedMatches]);

  const toggleVerify = (id: number) => {
    const next = new Set(verifiedMatches);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setVerifiedMatches(next);
  };

  return (
    <main className="min-h-screen bg-[#FDFCFB] text-[#2D2E2E] font-sans p-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold">Clear<span className="text-indigo-400">Ledger</span></h1>
        {results && (
          <div className="flex gap-2">
            {['all', 'bankExc', 'ledgerExc', 'mismatches'].map((f) => (
              <button key={f} onClick={() => setFilter(f as any)} className={`px-3 py-1 text-xs font-bold uppercase rounded border ${filter === f ? 'bg-slate-200' : ''}`}>
                {f}
              </button>
            ))}
          </div>
        )}
      </header>

      {!results ? (
        <FileUpload onResults={setResults} />
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Date Range Filter</label>
            <div className="flex gap-4 mt-2">
              <input type="date" onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))} className="text-xs border p-2 rounded" />
              <input type="date" onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))} className="text-xs border p-2 rounded" />
            </div>
          </div>
          
          <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                <tr>
                  {['date', 'description', 'amount', 'status'].map(h => (
                    <th key={h} className="px-6 py-3 cursor-pointer" onClick={() => toggleSort(h)}>
                      {h} {sortConfig?.key === h ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {processedData.map((row: any, i: number) => (
                  <tr key={i} className="border-b hover:bg-slate-50">
                    <td className="px-6 py-4">{row.date}</td>
                    <td className="px-6 py-4">{row.description}</td>
                    <td className="px-6 py-4">{row.amount}</td>
                    <td className="px-6 py-4">{row.status}</td>
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
