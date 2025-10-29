
import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import UserManagement from './UserManagement';
import ContentManagement from './ContentManagement';
import { useLanguage } from '../contexts/LanguageContext';

const AdminPanel: React.FC = () => {
    const { t } = useLanguage();
    const location = useLocation();
    
    const NavLink: React.FC<{ to: string, children: React.ReactNode }> = ({ to, children }) => {
        const isActive = location.pathname.includes(to);
        return (
            <Link to={to} className={`px-4 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-accent text-white' : 'bg-primary text-text-secondary hover:bg-gray-800'}`}>
                {children}
            </Link>
        )
    };

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-text-primary">{t('adminPanel')}</h1>
            <div className="flex space-x-4 mb-8 border-b border-gray-800 pb-4">
               <NavLink to="/admin/users">{t('userManagement')}</NavLink>
               <NavLink to="/admin/content">{t('contentManagement')}</NavLink>
            </div>
            
            <Routes>
                <Route path="users" element={<UserManagement />} />
                <Route path="content" element={<ContentManagement />} />
                <Route index element={<UserManagement />} />
            </Routes>
        </div>
    );
};

export default AdminPanel;
