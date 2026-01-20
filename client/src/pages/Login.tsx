import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            await login(username);
            navigate('/');
        }
    };

    return (
        <div className="login-page flex-center" style={{ minHeight: '100vh', flexDirection: 'column', background: 'radial-gradient(circle at top right, #1e1b4b, #0f172a)' }}>
            <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '0.5rem', background: 'var(--gradient-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    LiterGames
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Enter the world of casual gaming
                </p>

                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Choose a username..."
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ textAlign: 'center', fontSize: '1.1rem' }}
                        autoFocus
                        disabled={loading}
                    />
                    <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Entering...' : 'Start Playing'}
                    </button>
                </form>
            </div>

            <div style={{ marginTop: '2rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>
                &copy; 2026 LiterGames Platform
            </div>
        </div>
    );
};

export default Login;
