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
    if (!files.bankStatement || !files.ledgerSheet) {
      alert('Please select both files first.');
      return;
    }
    
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
      console.error(error);
      alert('Error during reconciliation. Please check your files.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white/50 backdrop-blur-md rounded-3xl shadow-xl border border-pink-100">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-semibold text-gray-700 mb-2">Upload Statements</h2>
        <p className="text-gray-500">Select your bank PDF and ledger Excel to start reconciliation</p>
      </div>

      <div className="space-y-6">
        <div className="group relative">
          <label className="block text-sm font-medium text-gray-600 mb-2 ml-1">
            Thai Bank Statement (PDF)
          </label>
          <div className={`
            relative flex flex-col items-center justify-center w-full h-32 
            border-2 border-dashed rounded-2xl transition-all duration-300
            ${files.bankStatement ? 'border-green-200 bg-green-50/30' : 'border-blue-100 bg-blue-50/20 hover:border-blue-200'}
          `}>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange('bankStatement')}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center space-y-2 pointer-events-none">
              <svg className={`w-8 h-8 ${files.bankStatement ? 'text-green-400' : 'text-blue-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm text-gray-600 font-medium text-center px-4">
                {files.bankStatement ? files.bankStatement.name : 'Choose bank PDF'}
              </span>
            </div>
          </div>
        </div>

        <div className="group relative">
          <label className="block text-sm font-medium text-gray-600 mb-2 ml-1">
            Ledger Sheet (Excel)
          </label>
          <div className={`
            relative flex flex-col items-center justify-center w-full h-32 
            border-2 border-dashed rounded-2xl transition-all duration-300
            ${files.ledgerSheet ? 'border-green-200 bg-green-50/30' : 'border-purple-100 bg-purple-50/20 hover:border-purple-200'}
          `}>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange('ledgerSheet')}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center space-y-2 pointer-events-none">
              <svg className={`w-8 h-8 ${files.ledgerSheet ? 'text-green-400' : 'text-purple-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-gray-600 font-medium text-center px-4">
                {files.ledgerSheet ? files.ledgerSheet.name : 'Choose ledger Excel'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={isUploading || !files.bankStatement || !files.ledgerSheet}
          className={`
            w-full py-4 rounded-2xl font-semibold text-white transition-all duration-300 transform active:scale-95
            ${isUploading || !files.bankStatement || !files.ledgerSheet 
              ? 'bg-gray-300 cursor-not-allowed shadow-none' 
              : 'bg-gradient-to-r from-pink-300 to-purple-300 shadow-lg hover:shadow-pink-100/50 hover:-translate-y-1'}
          `}
        >
          {isUploading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : 'Reconcile Now'}
        </button>
      </div>
    </div>
  );
}
