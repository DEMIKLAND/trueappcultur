
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const ProfilePage: React.FC = () => {
    const { currentUser, updateCurrentUser } = useAuth();
    const { t } = useLanguage();
    
    const [nickname, setNickname] = useState(currentUser?.nickname || '');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        if (!currentUser) return;
        
        const updates: { nickname?: string, passwordHash?: string } = {};

        if (nickname.trim() !== currentUser.nickname) {
            updates.nickname = nickname.trim();
        }
        if (password.trim()) {
            updates.passwordHash = password.trim(); // Not hashed for demo
        }

        if (Object.keys(updates).length > 0) {
            await updateCurrentUser(updates);
            setMessage(t('profileUpdated'));
            setPassword(''); // Clear password field after update
        }
    };

    return (
        <div className="container mx-auto max-w-lg">
            <div className="bg-secondary p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold mb-6 text-text-primary">{t('profile')}</h1>
                
                {message && <p className="text-green-400 bg-green-900/50 p-3 rounded-md mb-4 text-center">{message}</p>}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-secondary">{t('email')}</label>
                        <input
                            id="email"
                            type="email"
                            value={currentUser?.email || ''}
                            disabled
                            className="w-full px-3 py-2 mt-1 bg-primary border border-gray-600 rounded-md text-text-secondary cursor-not-allowed"
                        />
                    </div>
                     <div>
                        <label htmlFor="nickname" className="block text-sm font-medium text-text-secondary">{t('nickname')}</label>
                        <input
                            id="nickname"
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            required
                            className="w-full px-3 py-2 mt-1 bg-primary border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-text-secondary">{t('newPassword')}</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 mt-1 bg-primary border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 font-semibold text-white bg-accent rounded-md hover:bg-opacity-90 transition-transform duration-200 active:scale-95"
                    >
                        {t('updateProfile')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
