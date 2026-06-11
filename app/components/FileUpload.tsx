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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* PDF Upload */}
        <div className="relative group">
          <div className="flex flex-col h-full bg-white border border-gray-100 rounded-2xl p-8 transition-all duration-500 hover:border-pink-200 hover:shadow-[0_20px_50px_rgba(244,114,182,0.05)]">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Source 01</h3>
            <div className="flex-1 flex flex-col justify-center">
              <label className="cursor-pointer">
                <input type="file" accept=".pdf" onChange={handleFileChange('bankStatement')} className="hidden" />
                <div className="flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center transition-all duration-500 ${files.bankStatement ? 'bg-pink-50 text-pink-400 scale-110' : 'bg-gray-50 text-gray-300'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Thai Bank Statement</h4>
                  <p className="text-[11px] text-gray-400 tracking-tight px-4 leading-relaxed">
                    {files.bankStatement ? files.bankStatement.name : 'Drag & drop bank PDF or click to browse'}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Excel Upload */}
        <div className="relative group">
          <div className="flex flex-col h-full bg-white border border-gray-100 rounded-2xl p-8 transition-all duration-500 hover:border-pink-200 hover:shadow-[0_20px_50px_rgba(244,114,182,0.05)]">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Source 02</h3>
            <div className="flex-1 flex flex-col justify-center">
              <label className="cursor-pointer">
                <input type="file" accept=".xlsx,.xls" onChange={handleFileChange('ledgerSheet')} className="hidden" />
                <div className="flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center transition-all duration-500 ${files.ledgerSheet ? 'bg-pink-50 text-pink-400 scale-110' : 'bg-gray-50 text-gray-300'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Ledger Spreadsheet</h4>
                  <p className="text-[11px] text-gray-400 tracking-tight px-4 leading-relaxed">
                    {files.ledgerSheet ? files.ledgerSheet.name : 'Upload .xlsx or .xls ledger file'}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleUpload}
          disabled={isUploading || !files.bankStatement || !files.ledgerSheet}
          className={`
            relative px-12 py-4 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-500
            ${isUploading || !files.bankStatement || !files.ledgerSheet 
              ? 'bg-gray-50 text-gray-300 cursor-not-allowed' 
              : 'bg-black text-white hover:bg-gray-900 hover:shadow-2xl hover:shadow-pink-100 hover:-translate-y-0.5 active:translate-y-0'}
          `}
        >
          {isUploading ? (
            <span className="flex items-center gap-3">
              <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </span>
          ) : 'Execute Reconciliation'}
        </button>
      </div>
    </div>
  );
}
