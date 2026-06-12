'use client';

import React, { useState, useMemo } from 'react';
import FileUpload from './components/FileUpload';
import { useLanguage } from './context/LanguageContext';

export default function Home() {
  const [results, setResults] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'mismatches' | 'bank'>('all');
  const { lang, setLang, t } = useLanguage();

  const processedData = useMemo(() => {
    if (!results) return [];
    if (filter === 'mismatches') {
      return [...results.unmatchedBank.map((b: any) => ({ ...b, type: 'Bank Unmatched' })), 
              ...results.unmatchedLedger.map((l: any) => ({ ...l, type: 'Ledger Unmatched' }))];
    }
    if (filter === 'bank') {
      return results.unmatchedBank.map((b: any) => ({ ...b, type: 'Bank Statement' }));
    }
    return results.matches.map((m: any) => ({ ...m.bank, type: 'Match', ledger: m.ledger }));
  }, [results, filter]);

  const exportReport = () => {
      console.log('Exporting report...');
  };

  return (
    <main className="min-h-screen bg-[#FDFCFB] text-[#2D2E2E] font-sans p-8">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Bank Recon App</h1>
          <button onClick={() => setLang(lang === 'en' ? 'th' : 'en')} className="px-3 py-1 text-xs font-bold uppercase rounded border">
              {lang === 'en' ? 'EN' : 'TH'}
          </button>
      </div>
      {!results ? (
        <FileUpload onResults={setResults} />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{t('bankStatements')}</p>
                  <p className="text-lg font-bold">{results.stats.totalBank}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{t('excelLedger')}</p>
                  <p className="text-lg font-bold">{results.stats.totalLedger}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{t('verified')}</p>
                  <p className="text-lg font-bold">{results.stats.matchCount}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{t('matchRate')}</p>
                  <p className="text-lg font-bold">{results.stats.matchRate?.toFixed(1) || 0}%</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{t('mismatch')}</p>
                  <p className="text-lg font-bold">{results.stats.mismatchCount || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{t('possibleMatch')}</p>
                  <p className="text-lg font-bold">{results.stats.possibleMatchCount || 0}</p>
              </div>
          </div>
          <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border">
            <div className="flex justify-between p-4 border-b">
              <div className="flex gap-2">
                  <button onClick={() => setFilter('all')} className="px-3 py-1 text-xs font-bold uppercase rounded border">{t('all')}</button>
                  <button onClick={() => setFilter('mismatches')} className="px-3 py-1 text-xs font-bold uppercase rounded border">{t('mismatches')}</button>
                  <button onClick={() => setFilter('bank')} className="px-3 py-1 text-xs font-bold uppercase rounded border">{t('bank')}</button>
              </div>
              <button onClick={exportReport} className="px-3 py-1 text-xs font-bold uppercase rounded border">{t('export')}</button>
            </div>
            <table className="w-full text-xs text-left">
              <thead className="text-slate-700 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3">{t('date')}</th>
                  <th className="px-4 py-3">{t('time')}</th>
                  <th className="px-4 py-3">{t('items')}</th>
                  <th className="px-4 py-3">{t('amount')}</th>
                  <th className="px-4 py-3">{t('balance')}</th>
                  <th className="px-4 py-3">{t('channel')}</th>
                </tr>
              </thead>
              <tbody>
                {processedData.map((row: any, i: number) => (
                  <tr key={i} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3">{new Date(row.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{row.time || 'N/A'}</td>
                    <td className="px-4 py-3">{row.items || 'N/A'}</td>
                    <td className="px-4 py-3">{row.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">{row.balance || 'N/A'}</td>
                    <td className="px-4 py-3">{row.channel || 'N/A'}</td>
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