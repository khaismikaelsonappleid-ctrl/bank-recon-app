'use client';
import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Header() {
  const { lang, setLang } = useLanguage();
  
  return (
    <header className="relative flex items-center justify-between mb-8 z-50">
      <h1 className="text-3xl font-semibold">Clear<span className="text-indigo-400">Ledger</span></h1>
      <button 
        onClick={() => setLang(lang === 'en' ? 'th' : 'en')} 
        className="px-3 py-1 text-xs font-bold uppercase rounded border z-50 relative"
      >
        {lang === 'en' ? 'EN' : 'TH'}
      </button>
    </header>
  );
}
