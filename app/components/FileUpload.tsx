'use client';

import React, { useState, useCallback } from 'react';

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

interface FileWithGroup extends File {
  group?: 'bank' | 'ledger';
}

export default function FileUpload({ onResults }: { onResults: (data: ReconciliationResult) => void }) {
  const [bankFiles, setBankFiles] = useState<File[]>([]);
  const [ledgerFiles, setLedgerFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const addFiles = (fileList: FileList | null, type: 'bank' | 'ledger') => {
    if (!fileList) return;
    const newFiles = Array.from(fileList);
    if (type === 'bank') {
      setBankFiles(prev => [...prev, ...newFiles.filter(f => f.name.toLowerCase().endsWith('.pdf'))]);
    } else {
      setLedgerFiles(prev => [...prev, ...newFiles.filter(f => 
        f.name.toLowerCase().endsWith('.xlsx') || 
        f.name.toLowerCase().endsWith('.xls') || 
        f.name.toLowerCase().endsWith('.csv')
      )]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent, type: 'bank' | 'ledger') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFiles(e.dataTransfer.files, type);
    }
  }, []);

  const removeFile = (index: number, type: 'bank' | 'ledger') => {
    if (type === 'bank') {
      setBankFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setLedgerFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleUpload = async () => {
    if (bankFiles.length === 0 || ledgerFiles.length === 0) return;
    setIsUploading(true);
    
    const formData = new FormData();
    bankFiles.forEach(file => formData.append('bankStatements', file));
    ledgerFiles.forEach(file => formData.append('ledgerSheets', file));

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

  const FileList = ({ files, type }: { files: File[], type: 'bank' | 'ledger' }) => (
    <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
      {files.map((file, idx) => (
        <div key={idx} className="flex items-center justify-between bg-white/40 border border-slate-100/50 rounded-xl px-3 py-2 animate-in fade-in slide-in-from-top-1 duration-300">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`p-1.5 rounded-lg ${type === 'bank' ? 'bg-indigo-50 text-indigo-400' : 'bg-emerald-50 text-emerald-400'}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-slate-600 truncate">{file.name}</span>
          </div>
          <button 
            onClick={() => removeFile(idx, type)}
            className="text-slate-300 hover:text-rose-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Source 01: Bank Statement Dropzone */}
        <div className="flex flex-col h-full">
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={(e) => handleDrop(e, 'bank')}
            className={`
              relative flex-1 flex flex-col bg-white/60 backdrop-blur-sm border-2 border-dashed rounded-[2.5rem] p-8 transition-all duration-500
              ${dragActive ? 'border-indigo-400 bg-indigo-50/30' : bankFiles.length > 0 ? 'border-indigo-100 bg-indigo-50/10' : 'border-slate-100 hover:border-slate-200'}
            `}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Source 01</span>
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-500 text-[8px] font-black uppercase tracking-widest">PDFs Only</span>
            </div>
            
            <label className="cursor-pointer group flex-1 flex flex-col items-center justify-center">
              <input type="file" multiple accept=".pdf" onChange={(e) => addFiles(e.target.files, 'bank')} className="hidden" />
              <div className={`
                w-16 h-16 rounded-[1.5rem] mb-6 flex items-center justify-center transition-all duration-500
                ${bankFiles.length > 0 ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-100 scale-105' : 'bg-slate-50 text-slate-300 group-hover:bg-slate-100 group-hover:text-indigo-400'}
              `}>
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">Bank Statements</h4>
              <p className="text-[10px] text-slate-400 font-medium">Drag & drop or click to browse</p>
            </label>

            {bankFiles.length > 0 && <FileList files={bankFiles} type="bank" />}
          </div>
        </div>

        {/* Source 02: Ledger Dropzone */}
        <div className="flex flex-col h-full">
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={(e) => handleDrop(e, 'ledger')}
            className={`
              relative flex-1 flex flex-col bg-white/60 backdrop-blur-sm border-2 border-dashed rounded-[2.5rem] p-8 transition-all duration-500
              ${dragActive ? 'border-emerald-400 bg-emerald-50/30' : ledgerFiles.length > 0 ? 'border-emerald-100 bg-emerald-50/10' : 'border-slate-100 hover:border-slate-200'}
            `}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Source 02</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-500 text-[8px] font-black uppercase tracking-widest">XLSX / CSV</span>
            </div>
            
            <label className="cursor-pointer group flex-1 flex flex-col items-center justify-center">
              <input type="file" multiple accept=".xlsx,.xls,.csv" onChange={(e) => addFiles(e.target.files, 'ledger')} className="hidden" />
              <div className={`
                w-16 h-16 rounded-[1.5rem] mb-6 flex items-center justify-center transition-all duration-500
                ${ledgerFiles.length > 0 ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-100 scale-105' : 'bg-slate-50 text-slate-300 group-hover:bg-slate-100 group-hover:text-emerald-400'}
              `}>
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">Internal Ledgers</h4>
              <p className="text-[10px] text-slate-400 font-medium">Add multiple files to reconcile</p>
            </label>

            {ledgerFiles.length > 0 && <FileList files={ledgerFiles} type="ledger" />}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        <button
          onClick={handleUpload}
          disabled={isUploading || bankFiles.length === 0 || ledgerFiles.length === 0}
          className={`
            relative w-full sm:w-[280px] py-4 rounded-full text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-500 overflow-hidden group
            ${isUploading || bankFiles.length === 0 || ledgerFiles.length === 0 
              ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
              : 'bg-slate-900 text-white hover:bg-black hover:shadow-2xl hover:shadow-indigo-200/50 hover:-translate-y-1'}
          `}
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            {isUploading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white/50" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing Engine</span>
              </>
            ) : 'Synchronize Data'}
          </span>
          {!isUploading && bankFiles.length > 0 && ledgerFiles.length > 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          )}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">End-to-End Encrypted</p>
        </div>
      </div>
    </div>
  );
}
