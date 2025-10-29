
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { PlayerProvider } from './contexts/PlayerContext';
import LanguageSelector from './components/LanguageSelector';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import Header from './components/Header';
import ProfilePage from './components/ProfilePage';
import GlobalPlayer from './components/GlobalPlayer';
import { Role } from './types';
import ContentDetailPage from './components/ContentDetailPage';

const AppContent: React.FC = () => {
    const { language } = useLanguage();
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-primary"><div className="text-2xl text-accent">Loading...</div></div>;
    }

    if (!language) {
        return <LanguageSelector />;
    }

    const canAccessAdmin = currentUser?.role === Role.ADMIN || currentUser?.role === Role.MODERATOR;

    return (
        <HashRouter>
            {currentUser && <Header />}
            <main className="p-4 md:p-8 pb-32">
                <Routes>
                    <Route path="/auth" element={!currentUser ? <AuthPage /> : <Navigate to="/" />} />
                    <Route path="/admin/*" element={canAccessAdmin ? <AdminPanel /> : <Navigate to="/" />} />
                    <Route path="/profile" element={currentUser ? <ProfilePage /> : <Navigate to="/auth" />} />
                    <Route path="/content/:contentId" element={currentUser ? <ContentDetailPage /> : <Navigate to="/auth" />} />
                    <Route path="/" element={currentUser ? <Dashboard /> : <Navigate to="/auth" />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
            {currentUser && <GlobalPlayer />}
        </HashRouter>
    );
};


const App: React.FC = () => {
    return (
        <LanguageProvider>
            <DataProvider>
                <AuthProvider>
                    <PlayerProvider>
                        <AppContent />
                    </PlayerProvider>
                </AuthProvider>
            </DataProvider>
        </LanguageProvider>
    );
};

export default App;