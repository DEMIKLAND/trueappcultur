
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Role } from '../types';

const Header: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const { t, setLanguage, language } = useLanguage();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };
    
    const canAccessAdmin = currentUser?.role === Role.ADMIN || currentUser?.role === Role.MODERATOR;

    return (
        <header className="bg-secondary p-4 shadow-lg flex justify-between items-center sticky top-0 z-40">
            <Link to="/" className="text-3xl font-sans font-normal text-white tracking-tighter">
                Cultur<sup className="text-xs top-[-1.2em]">&reg;</sup>
            </Link>
            <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm">
                    <button onClick={() => setLanguage('en')} className={`px-2 py-1 rounded ${language === 'en' ? 'text-accent font-bold' : 'text-text-secondary'}`}>EN</button>
                    <span className="text-gray-600">|</span>
                    <button onClick={() => setLanguage('ru')} className={`px-2 py-1 rounded ${language === 'ru' ? 'text-accent font-bold' : 'text-text-secondary'}`}>RU</button>
                </div>

                {currentUser && <span className="hidden md:inline text-text-secondary">Welcome, {currentUser.nickname}</span>}
                
                <Link to="/profile" className="text-text-primary hover:text-accent transition-colors" title={t('profile')}>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </Link>

                {canAccessAdmin && (
                     <Link to="/admin" className="text-text-primary hover:text-accent transition-colors">{t('adminPanel')}</Link>
                )}
                <button
                    onClick={handleLogout}
                    className="bg-accent px-4 py-2 text-white font-semibold rounded-md hover:bg-opacity-80 transition"
                >
                    {t('logout')}
                </button>
            </div>
        </header>
    );
};

export default Header;
