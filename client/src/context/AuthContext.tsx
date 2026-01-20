import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

interface User {
    _id: string; // Mongo ID
    username: string;
    avatar: string;
}

interface AuthContextType {
    user: User | null;
    login: (username: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: async () => { },
    logout: () => { },
    loading: false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const { socket } = useSocket();

    useEffect(() => {
        // Check local storage for existing session
        const storedUser = localStorage.getItem('litergames_user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            if (socket) {
                socket.emit('user:join', { ...parsed, id: parsed._id });
            }
        }
    }, [socket]);

    const login = async (username: string) => {
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || errData.error || 'Login failed');
            }

            const data = await res.json();
            setUser(data);
            localStorage.setItem('litergames_user', JSON.stringify(data));

            if (socket) {
                socket.emit('user:join', { ...data, id: data._id });
            }
        } catch (e: any) {
            console.error(e);
            alert(e.message || 'Login Error');
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('litergames_user');
        if (socket) socket.disconnect();
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
