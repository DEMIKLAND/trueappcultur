
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const RegisterForm: React.FC = () => {
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = await register(nickname, email, password);
        if (success) {
            navigate('/');
        } else {
            setError('User with this email already exists.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-red-500 text-center">{error}</p>}
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
                <label htmlFor="email-reg" className="block text-sm font-medium text-text-secondary">{t('email')}</label>
                <input
                    id="email-reg"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 mt-1 bg-primary border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
            </div>
            <div>
                <label htmlFor="password-reg" className="block text-sm font-medium text-text-secondary">{t('password')}</label>
                <input
                    id="password-reg"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 mt-1 bg-primary border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
            </div>
            <button
                type="submit"
                className="w-full py-3 font-semibold text-white bg-accent rounded-md hover:bg-opacity-90 transition-transform duration-200 active:scale-95"
            >
                {t('register')}
            </button>
        </form>
    );
};

export default RegisterForm;
