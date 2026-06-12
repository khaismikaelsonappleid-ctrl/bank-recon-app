'use client';
import React, { createContext, useContext, useState } from 'react';
import { dictionary } from '../../lib/dictionary';

type Lang = 'en' | 'fr';
const LanguageContext = createContext({
  lang: 'en' as Lang,
  setLang: (l: Lang) => {},
  t: (key: keyof typeof dictionary.en): string => ''
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Lang>('en');
  const t = (key: keyof typeof dictionary.en): string => dictionary[lang][key];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);