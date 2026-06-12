'use client';
import React, { createContext, useContext, useState, useMemo } from 'react';
import { dictionary } from '../lib/dictionary';

type Lang = 'en' | 'th';

const LanguageContext = createContext({
  lang: 'en' as Lang,
  setLang: (l: Lang) => {},
  t: (key: any): string => ''
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Lang>('en');

  const t = useMemo(() => (key: keyof typeof dictionary.en): string => dictionary[lang][key], [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
