'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';

interface User {
    id: number;
    username: string;
    email: string;
    user_type: 'MERCHANT' | 'ADMIN' | 'CUSTOMER';
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (userData: any) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = async () => {
        setIsLoading(true);
        try {
            // Assuming there's a /api/me/ endpoint that returns the current user
            const response = await apiClient.get<any>('/api/users/me/');
            if (response && response.id) {
                setUser(response);
            } else {
                setUser(null);
            }
        } catch (error: any) {
            // Don't log 401 errors as they're expected for unauthenticated users
            if (!error.message || !error.message.includes('HTTP 401')) {
                console.error('Failed to fetch user:', error);
            }
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const login = async (userData: any) => {
        try {
            // First authenticate with the API
            await apiClient.login(userData);
            // Then refresh user data
            await refreshUser();
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await apiClient.post('/api/users/logout/', {});
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setUser(null);
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: !!user,
            login,
            logout,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
