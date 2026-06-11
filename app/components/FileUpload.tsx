'use client';

import React, { useState } from 'react';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
}

interface ReconciliationResult {
  matches: Array<{ bank: Transaction; ledger: Transaction }>;
  unmatchedBank: Transaction[];
  unmatchedLedger: Transaction[];
  stats: {
    totalBank: number;
    totalLedger: number;
    matchCount: number;
    matchRate: number;
  };
}

interface FileUploadState {
  bankStatement: File | null;
  ledgerSheet: File | null;
}

export default function FileUpload({ onResults }: { onResults: (data: ReconciliationResult) => void }) {
  const [files, setFiles] = useState<FileUploadState>({
    bankStatement: null,
    ledgerSheet: null,
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (type: keyof FileUploadState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFiles((prev) => ({ ...prev, [type]: selectedFile }));
  };

  const handleUpload = async () => {
    if (!files.bankStatement || !files.ledgerSheet) return;
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('bankStatement', files.bankStatement);
    formData.append('ledgerSheet', files.ledgerSheet);

    try {
      const response = await fetch('/api/reconcile', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Reconciliation failed');
      const result = await response.json();
      onResults(result);
    } catch (error) {
      alert('Reconciliation encountered an issue. Please verify file formats.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
        {/* Source 01: Bank Statement */}
        <div className="relative">
          <div className={`
            h-full bg-white/60 backdrop-blur-sm border rounded-3xl p-6 md:p-8 transition-all duration-500
            ${files.bankStatement ? 'border-indigo-100 shadow-lg shadow-indigo-500/5' : 'border-slate-100 hover:border-slate-200 shadow-sm'}
          `}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Source 01</span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-500 text-[8px] font-bold uppercase tracking-tighter">PDF Format</span>
            </div>
            
            <label className="cursor-pointer group block">
              <input type="file" accept=".pdf" onChange={handleFileChange('bankStatement')} className="hidden" />
              <div className="flex flex-col items-center py-4">
                <div className={`
                  w-12 h-12 rounded-2xl mb-4 flex items-center justify-center transition-all duration-500
                  ${files.bankStatement ? 'bg-indigo-500 text-white scale-110 shadow-md shadow-indigo-200' : 'bg-slate-50 text-slate-300 group-hover:bg-slate-100 group-hover:text-slate-400'}
                `}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-slate-800 mb-1">Bank Statement</h4>
                <p className="text-[10px] text-slate-400 text-center line-clamp-1 px-4">
                  {files.bankStatement ? files.bankStatement.name : 'Select PDF statement'}
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Source 02: Internal Ledger */}
        <div className="relative">
          <div className={`
            h-full bg-white/60 backdrop-blur-sm border rounded-3xl p-6 md:p-8 transition-all duration-500
            ${files.ledgerSheet ? 'border-emerald-100 shadow-lg shadow-emerald-500/5' : 'border-slate-100 hover:border-slate-200 shadow-sm'}
          `}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Source 02</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-500 text-[8px] font-bold uppercase tracking-tighter">Excel / CSV</span>
            </div>
            
            <label className="cursor-pointer group block">
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange('ledgerSheet')} className="hidden" />
              <div className="flex flex-col items-center py-4">
                <div className={`
                  w-12 h-12 rounded-2xl mb-4 flex items-center justify-center transition-all duration-500
                  ${files.ledgerSheet ? 'bg-emerald-500 text-white scale-110 shadow-md shadow-emerald-200' : 'bg-slate-50 text-slate-300 group-hover:bg-slate-100 group-hover:text-slate-400'}
                `}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-slate-800 mb-1">Internal Ledger</h4>
                <p className="text-[10px] text-slate-400 text-center line-clamp-1 px-4">
                  {files.ledgerSheet ? files.ledgerSheet.name : 'Select ledger records'}
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleUpload}
          disabled={isUploading || !files.bankStatement || !files.ledgerSheet}
          className={`
            relative w-full sm:w-auto min-w-[200px] px-8 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 overflow-hidden
            ${isUploading || !files.bankStatement || !files.ledgerSheet 
              ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
              : 'bg-slate-900 text-white hover:bg-black hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'}
          `}
        >
          <span className="flex items-center justify-center gap-3">
            {isUploading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : 'Analyze Records'}
          </span>
        </button>
        <p className="text-[9px] text-slate-400 font-medium">Secured with 256-bit AES encryption</p>
      </div>
    </div>
  );
}
