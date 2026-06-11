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
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10 md:mb-12">
        {/* PDF Upload */}
        <div className="relative group">
          <div className="flex flex-col h-full bg-white border border-slate-100 rounded-[1.5rem] md:rounded-[2rem] p-8 md:p-10 transition-all duration-500 hover:border-indigo-100 hover:shadow-[0_30px_60px_rgba(79,70,229,0.05)]">
            <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.25em] mb-6 md:mb-8 text-center md:text-left">Source 01 • PDF</h3>
            <div className="flex-1 flex flex-col justify-center">
              <label className="cursor-pointer group/label">
                <input type="file" accept=".pdf" onChange={handleFileChange('bankStatement')} className="hidden" />
                <div className="flex flex-col items-center text-center">
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl mb-4 md:mb-6 flex items-center justify-center transition-all duration-500 ${files.bankStatement ? 'bg-indigo-50 text-indigo-500 scale-110 rotate-3' : 'bg-slate-50 text-slate-300 group-hover/label:bg-slate-100 group-hover/label:text-slate-400'}`}>
                    <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-base font-semibold text-slate-900 mb-2">Bank Statement</h4>
                  <p className="text-xs text-slate-400 tracking-tight px-4 leading-relaxed max-w-[240px]">
                    {files.bankStatement ? files.bankStatement.name : 'Upload the official bank export in PDF format'}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Excel Upload */}
        <div className="relative group">
          <div className="flex flex-col h-full bg-white border border-slate-100 rounded-[1.5rem] md:rounded-[2rem] p-8 md:p-10 transition-all duration-500 hover:border-indigo-100 hover:shadow-[0_30px_60px_rgba(79,70,229,0.05)]">
            <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.25em] mb-6 md:mb-8 text-center md:text-left">Source 02 • XLSX</h3>
            <div className="flex-1 flex flex-col justify-center">
              <label className="cursor-pointer group/label">
                <input type="file" accept=".xlsx,.xls" onChange={handleFileChange('ledgerSheet')} className="hidden" />
                <div className="flex flex-col items-center text-center">
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl mb-4 md:mb-6 flex items-center justify-center transition-all duration-500 ${files.ledgerSheet ? 'bg-emerald-50 text-emerald-500 scale-110 -rotate-3' : 'bg-slate-50 text-slate-300 group-hover/label:bg-slate-100 group-hover/label:text-slate-400'}`}>
                    <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-base font-semibold text-slate-900 mb-2">Internal Ledger</h4>
                  <p className="text-xs text-slate-400 tracking-tight px-4 leading-relaxed max-w-[240px]">
                    {files.ledgerSheet ? files.ledgerSheet.name : 'Upload your internal accounting records'}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center px-6">
        <button
          onClick={handleUpload}
          disabled={isUploading || !files.bankStatement || !files.ledgerSheet}
          className={`
            relative w-full sm:w-auto px-10 md:px-14 py-4 md:py-5 rounded-full text-[11px] md:text-xs font-bold uppercase tracking-[0.3em] transition-all duration-500 overflow-hidden
            ${isUploading || !files.bankStatement || !files.ledgerSheet 
              ? 'bg-slate-50 text-slate-300 cursor-not-allowed' 
              : 'bg-slate-900 text-white hover:bg-black hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:-translate-y-1 active:translate-y-0'}
          `}
        >
          <span className="relative z-10 flex items-center justify-center gap-4">
            {isUploading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : 'Analyze Records'}
          </span>
        </button>
      </div>
    </div>
  );
}
