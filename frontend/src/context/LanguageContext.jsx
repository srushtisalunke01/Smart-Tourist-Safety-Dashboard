import React, { createContext, useContext } from 'react';
import { useAppStore } from '../store/useAppStore';
import { translations } from '../locales/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { language, setLanguage } = useAppStore();
  
  const t = new Proxy(
    (key) => {
      const dict = translations[language] || translations.en;
      return dict[key] || key;
    },
    {
      get(target, prop) {
        if (prop === 'then' || typeof prop === 'symbol') return undefined;
        const dict = translations[language] || translations.en;
        return dict[prop] || prop;
      }
    }
  );

  return (
    <LanguageContext.Provider value={{ lang: language, setLang: setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
