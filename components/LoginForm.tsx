
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = await login(email, password);
        if (success) {
            navigate('/');
        } else {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-red-500 text-center">{error}</p>}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary">{t('email')}</label>
                <input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 mt-1 bg-primary border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary">{t('password')}</label>
                <input
                    id="password"
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
                {t('login')}
            </button>
        </form>
    );
};

export default LoginForm;
