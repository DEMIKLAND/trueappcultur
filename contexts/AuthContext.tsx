import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, Role } from '../types';
import { useData } from './DataContext';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<boolean>;
    logout: () => void;
    register: (nickname: string, email: string, pass: string) => Promise<boolean>;
    updateCurrentUser: (details: Partial<Pick<User, 'nickname' | 'passwordHash'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { users, addUser, updateUser } = useData();

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('cultur_user');
            if (storedUser) {
                setCurrentUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('cultur_user');
        }
        setLoading(false);
    }, []);

    const login = async (email: string, pass: string): Promise<boolean> => {
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user && user.passwordHash === pass) {
            setCurrentUser(user);
            localStorage.setItem('cultur_user', JSON.stringify(user));
            return true;
        }
        return false;
    };

    const register = async (nickname: string, email: string, pass: string): Promise<boolean> => {
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            return false; // User already exists
        }
        // FIX: Changed string 'USER' to Role.USER to match the enum type required by addUser.
        const newUser = addUser(nickname, email, pass, Role.USER);
        setCurrentUser(newUser);
        localStorage.setItem('cultur_user', JSON.stringify(newUser));
        return true;
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('cultur_user');
    };

    const updateCurrentUser = async (details: Partial<Pick<User, 'nickname' | 'passwordHash'>>) => {
        if (!currentUser) return;

        const updatedUser: User = { ...currentUser };
        if (details.nickname) {
            updatedUser.nickname = details.nickname;
        }
        if (details.passwordHash) {
            updatedUser.passwordHash = details.passwordHash;
        }
        
        updateUser(updatedUser);
        setCurrentUser(updatedUser);
        localStorage.setItem('cultur_user', JSON.stringify(updatedUser));
    };
    
    return (
        <AuthContext.Provider value={{ currentUser, loading, login, logout, register, updateCurrentUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
