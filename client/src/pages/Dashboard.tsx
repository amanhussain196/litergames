import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Lobby from './Lobby';
import GameRoom from './GameRoom'; // We'll create this
// import ChatBox from '../components/social/ChatBox'; // Later
// import FriendList from '../components/social/FriendList'; // Later

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* Sidebar (Desktop: Fixed, Mobile: Toggle) */}
            <aside
                className="glass-panel"
                style={{
                    width: '300px',
                    margin: '1rem',
                    display: sidebarOpen ? 'flex' : 'none',
                    flexDirection: 'column',
                    // Desktop override in CSS usually, but inline for now: 
                    // We need a media query really. 
                }}
            >
                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '1rem' }}>
                        <img src={user?.avatar} alt="Avatar" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                        <div>
                            <div style={{ fontWeight: 'bold' }}>{user?.username}</div>
                            <div style={{ fontSize: '0.8rem', color: '#4ade80' }}>Online</div>
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1, padding: '1rem' }}>
                    <h3>Friends</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '1rem' }}>
                        No friends online yet.
                    </p>
                    {/* FriendList Component Here */}
                </div>

                <div style={{ padding: '1rem' }}>
                    <button className="btn-ghost" onClick={logout} style={{ width: '100%', textAlign: 'left' }}>
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <header style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ background: 'var(--gradient-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        LiterGames
                    </h2>
                    {/* Mobile Toggle */}
                    <button className="btn-ghost" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        Menu
                    </button>
                </header>

                <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
                    <Routes>
                        <Route path="/" element={<Lobby />} />
                        <Route path="/room/:roomId" element={<GameRoom />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
