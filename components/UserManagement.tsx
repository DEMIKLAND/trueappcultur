
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { User, Role } from '../types';

const UserManagement: React.FC = () => {
    const { users, updateUser, deleteUser, addUser } = useData();
    const { t } = useLanguage();
    const { currentUser } = useAuth();
    
    const initialFormState = { nickname: '', email: '', password: '', role: Role.USER, badge: null as 'note' | 'gear' | null };
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [error, setError] = useState('');

    if (currentUser?.role !== Role.ADMIN) {
        return <p>Access Denied. Only Administrators can manage users.</p>;
    }

    const handleRoleChange = (user: User) => {
        const newRole = user.role === Role.MODERATOR ? Role.USER : Role.MODERATOR;
        updateUser({ ...user, role: newRole });
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value === '' ? null : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
            setError('User with this email already exists.');
            return;
        }
        addUser(formData.nickname, formData.email, formData.password, formData.role, formData.badge);
        setIsFormVisible(false);
        setFormData(initialFormState);
    };
    
    const roleColor: Record<Role, string> = {
        [Role.ADMIN]: 'text-red-500',
        [Role.MODERATOR]: 'text-green-600',
        [Role.USER]: 'text-blue-400',
    };

    const badgeIcon: Record<'note' | 'gear', string> = {
        note: '🎵',
        gear: '⚙️',
    };

    return (
        <div className="bg-secondary p-6 rounded-lg shadow-lg">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{t('userManagement')}</h2>
                <button onClick={() => { setIsFormVisible(!isFormVisible); setError('') }} className="bg-accent text-white px-4 py-2 rounded-md font-semibold hover:bg-opacity-90">{isFormVisible ? t('cancel') : t('createUser')}</button>
            </div>
            
            {isFormVisible && (
                <form onSubmit={handleSubmit} className="space-y-4 mb-8 p-4 bg-primary rounded-md">
                     {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="nickname" value={formData.nickname} onChange={handleFormChange} placeholder={t('nickname')} required className="px-3 py-2 bg-secondary border border-gray-600 rounded-md"/>
                        <input name="email" type="email" value={formData.email} onChange={handleFormChange} placeholder={t('email')} required className="px-3 py-2 bg-secondary border border-gray-600 rounded-md"/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="password" type="password" value={formData.password} onChange={handleFormChange} placeholder={t('password')} required className="px-3 py-2 bg-secondary border border-gray-600 rounded-md"/>
                        <select name="role" value={formData.role} onChange={handleFormChange} className="px-3 py-2 bg-secondary border border-gray-600 rounded-md">
                            <option value={Role.USER}>User</option>
                            <option value={Role.MODERATOR}>Moderator</option>
                        </select>
                    </div>
                    {formData.role === Role.MODERATOR && (
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Moderator Badge (Optional)</label>
                            <select name="badge" value={formData.badge || ''} onChange={handleFormChange} className="mt-1 px-3 py-2 bg-secondary border border-gray-600 rounded-md w-full">
                                <option value="">No Badge</option>
                                <option value="note">🎵 Note</option>
                                <option value="gear">⚙️ Gear</option>
                            </select>
                        </div>
                    )}
                    <button type="submit" className="w-full py-2 font-semibold text-white bg-accent rounded-md hover:bg-opacity-90">{t('createUser')}</button>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-primary">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">{t('nickname')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">{t('email')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">{t('role')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-secondary divide-y divide-gray-700">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`font-bold ${roleColor[user.role]}`}>
                                        {user.nickname}
                                        {user.badge && user.role === Role.MODERATOR && <span className="ml-2">{badgeIcon[user.badge]}</span>}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    {user.role !== Role.ADMIN && (
                                        <>
                                            <button 
                                                onClick={() => handleRoleChange(user)}
                                                className="text-indigo-400 hover:text-indigo-300 transition"
                                            >
                                                {user.role === Role.MODERATOR ? t('demoteToUser') : t('promoteToModerator')}
                                            </button>
                                            <button 
                                                onClick={() => window.confirm(t('confirmDelete')) && deleteUser(user.id)}
                                                className="text-red-500 hover:text-red-400 transition"
                                            >
                                                {t('delete')}
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;