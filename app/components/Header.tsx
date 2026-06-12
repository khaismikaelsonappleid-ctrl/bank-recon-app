'use client';
import React, { useState } from 'react';

export default function Header() {
  const [lang, setLang] = useState<'EN' | 'TH'>('EN');
  
  return (
    <header className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-semibold">Clear<span className="text-indigo-400">Ledger</span></h1>
      <button onClick={() => setLang(l => l === 'EN' ? 'TH' : 'EN')} className="px-3 py-1 text-xs font-bold uppercase rounded border">
        {lang}
      </button>
    </header>
  );
}