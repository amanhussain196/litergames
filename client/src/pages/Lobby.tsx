import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const Lobby: React.FC = () => {
    const { socket } = useSocket();
    const navigate = useNavigate();
    const [joinCode, setJoinCode] = useState('');

    useEffect(() => {
        if (!socket) return;

        const handleRoomCreated = (roomId: string) => {
            // Auto join the room we just created
            socket.emit('room:join', { roomId });
        };

        const handleRoomJoined = (roomId: string) => {
            navigate(`/room/${roomId}`);
        };

        const handleError = (msg: string) => {
            alert(msg); // Basic error handling
        };

        socket.on('room:created', handleRoomCreated);
        socket.on('room:joined', handleRoomJoined);
        socket.on('error', handleError);

        return () => {
            socket.off('room:created', handleRoomCreated);
            socket.off('room:joined', handleRoomJoined);
            socket.off('error', handleError);
        };
    }, [socket, navigate]);

    const createRoom = () => {
        if (socket) {
            socket.emit('room:create');
        }
    };

    const joinRoom = (e: React.FormEvent) => {
        e.preventDefault();
        if (socket && joinCode.trim()) {
            socket.emit('room:join', { roomId: joinCode });
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h1 style={{ marginBottom: '1rem' }}>Welcome to the Lobby</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Create a private room or join a friend's game.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>

                    {/* Create Room */}
                    <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(255,255,255,0.03)' }}>
                        <h3>Create New Room</h3>
                        <p style={{ margin: '1rem 0', color: 'var(--text-secondary)' }}>
                            Start a new game session and invite your friends.
                        </p>
                        <button className="btn-primary" onClick={createRoom} style={{ width: '100%' }}>
                            Create Room
                        </button>
                    </div>

                    {/* Join Room */}
                    <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(255,255,255,0.03)' }}>
                        <h3>Join with Code</h3>
                        <p style={{ margin: '1rem 0', color: 'var(--text-secondary)' }}>
                            Enter the room code shared by your friend.
                        </p>
                        <form onSubmit={joinRoom}>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Enter Room Code"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                            />
                            <button className="btn-ghost" style={{ width: '100%', border: '1px solid rgba(255,255,255,0.1)' }}>
                                Join Room
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Game Modules Placeholder */}
            <h3 style={{ marginBottom: '1rem' }}>Available Games (Coming Soon)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                {['Chess', 'Tic Tac Toe', 'Carrom', 'Ludo'].map((game) => (
                    <div key={game} className="glass-panel" style={{ padding: '1rem', opacity: 0.5, cursor: 'not-allowed' }}>
                        <div style={{ height: '80px', background: '#334155', borderRadius: '8px', marginBottom: '0.5rem' }}></div>
                        <strong>{game}</strong>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Lobby;
