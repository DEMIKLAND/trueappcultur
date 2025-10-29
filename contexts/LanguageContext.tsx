
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../constants';

interface LanguageContextType {
    language: Language | null;
    setLanguage: (language: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language | null>(() => {
        return (localStorage.getItem('cultur_lang') as Language) || null;
    });

    const setLanguage = (lang: Language) => {
        localStorage.setItem('cultur_lang', lang);
        setLanguageState(lang);
    };

    const t = (key: string): string => {
        if (!language) return key;
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
