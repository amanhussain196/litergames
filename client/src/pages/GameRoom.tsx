import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import SimplePeer from 'simple-peer';
import TicTacToe from '../components/games/TicTacToe';

// --- Types ---
interface Player {
    id: string; // MongoID (Stable)
    username: string;
    avatar: string;
    ready: boolean;
    socketId?: string; // Needed for P2P
}

interface ChatMessage {
    id: string;
    from: string;
    text: string;
    timestamp: string;
    system?: boolean;
}

interface PeerData {
    peerId: string; // The Socket ID of the peer
    peer: SimplePeer.Instance;
}

const GameRoom: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const { socket } = useSocket();
    const { user } = useAuth();

    // State
    const [players, setPlayers] = useState<Player[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [msgInput, setMsgInput] = useState('');

    // Game State
    const [gameState, setGameState] = useState<{ board: (string | null)[], turn: string, winner: string | null }>({
        board: Array(9).fill(null),
        turn: 'X',
        winner: null
    });
    const [mySymbol, setMySymbol] = useState<'X' | 'O'>('X');

    // Voice State
    const [isMicOn, setIsMicOn] = useState(false);
    const peersRef = useRef<PeerData[]>([]);
    const userStream = useRef<MediaStream | null>(null);

    const chatEndRef = useRef<HTMLDivElement>(null);

    // --- Socket & Room Logic ---
    useEffect(() => {
        if (!socket || !roomId) return;

        const handleRoomUpdate = (data: { players: Player[] }) => {
            setPlayers(data.players);

            // Logic to determine Symbol (Stable based on ID, first in list = X)
            // Ideally server tells us, but this works for 2 players
            if (user) {
                // Find index of self in list
                const myIdx = data.players.findIndex(p => p.id === user._id);
                if (myIdx !== -1) setMySymbol(myIdx === 0 ? 'X' : 'O');
            }
        };

        const handleChat = (msg: ChatMessage) => {
            setMessages((prev) => {
                if (prev.some(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
        };

        const handleHistory = (msgs: ChatMessage[]) => {
            setMessages(msgs);
        };

        const handleGameUpdate = (newGame: any) => {
            setGameState(newGame);
        };

        const handleError = (err: string) => {
            console.error("Socket Error:", err);
        };

        // Voice Signal Handler
        const handleVoiceSignal = (data: { userId: string, socketId: string, signal: any }) => {
            const item = peersRef.current.find(p => p.peerId === data.socketId);
            if (item) {
                item.peer.signal(data.signal);
            } else {
                if (userStream.current) {
                    const peer = createPeer(data.socketId, data.signal, userStream.current);
                    peersRef.current.push({ peerId: data.socketId, peer });
                }
            }
        };

        socket.on('room:update', handleRoomUpdate);
        socket.on('chat:receive', handleChat);
        socket.on('chat:history', handleHistory);
        socket.on('game:update', handleGameUpdate);
        socket.on('error', handleError);
        socket.on('voice:signal', handleVoiceSignal);

        socket.emit('room:join', { roomId });

        return () => {
            socket.off('room:update', handleRoomUpdate);
            socket.off('chat:receive', handleChat);
            socket.off('chat:history', handleHistory);
            socket.off('game:update', handleGameUpdate);
            socket.off('error', handleError);
            socket.off('voice:signal', handleVoiceSignal);

            stopVoice();
        };
    }, [socket, roomId, navigate, user]);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    // --- Voice Logic ---
    const startVoice = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            userStream.current = stream;
            setIsMicOn(true);

            players.forEach(p => {
                if (p.id !== user?._id && p.socketId) {
                    const peer = createPeer(p.socketId, null, stream);
                    peersRef.current.push({ peerId: p.socketId, peer });
                }
            });

        } catch (err: any) {
            console.error("Mic Error:", err);
            // PermissionDeniedError, NotFoundError, etc.
            alert(`Could not access microphone. ${err.name}: ${err.message}`);
        }
    };

    const stopVoice = () => {
        if (userStream.current) {
            userStream.current.getTracks().forEach(track => track.stop());
            userStream.current = null;
        }
        peersRef.current.forEach(p => p.peer.destroy());
        peersRef.current = [];
        setIsMicOn(false);
    };

    const toggleMic = () => {
        if (isMicOn) stopVoice();
        else startVoice();
    };

    const createPeer = (userSocketId: string, incomingSignal: any, stream: MediaStream) => {
        const peer = new SimplePeer({
            initiator: !incomingSignal,
            trickle: false,
            stream,
        });

        peer.on('signal', signal => {
            socket?.emit('voice:signal', { targetId: userSocketId, signal });
        });

        peer.on('stream', remoteStream => {
            const audio = document.createElement('audio');
            audio.srcObject = remoteStream;
            audio.play();
        });

        if (incomingSignal) {
            peer.signal(incomingSignal);
        }

        return peer;
    }

    // --- Game Logic ---
    const handleMove = (index: number) => {
        socket?.emit('game:move', { roomId, index });
    };

    const handleReset = () => {
        socket?.emit('game:reset', { roomId });
    };


    // --- Chat Logic ---
    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!socket || !msgInput.trim()) return;
        socket.emit('chat:send', { text: msgInput });
        setMsgInput('');
    };

    const copyInvite = () => {
        navigator.clipboard.writeText(roomId || '');
        alert('Room Code copied!');
    };

    return (
        <div style={{ padding: '1rem', height: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div className="glass-panel flex-center" style={{ justifyContent: 'space-between', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn-ghost" onClick={() => { socket?.emit('room:leave'); navigate('/'); }}>
                        ← Leave
                    </button>
                    <h3>Room: <span onClick={copyInvite} style={{ color: 'var(--accent-primary)', fontFamily: 'monospace', cursor: 'pointer' }} title="Click to copy">{roomId}</span></h3>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className="btn-ghost"
                        style={{ background: isMicOn ? '#4ade80' : 'rgba(255,255,255,0.1)', color: isMicOn ? '#000' : 'inherit' }}
                        onClick={toggleMic}
                    >
                        {isMicOn ? 'Mic ON' : 'Mic OFF'}
                    </button>
                    <button className="btn-primary" onClick={copyInvite}>Invite</button>
                </div>
            </div>

            <div className="layout-grid" style={{ display: 'flex', flex: 1, gap: '1rem', overflow: 'hidden', flexDirection: 'column' }}>

                {/* Game Area */}
                <div className="glass-panel" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', flexDirection: 'column' }}>
                    {players.length < 2 && (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <h2>Waiting for opponent...</h2>
                            <p>Share code: <b>{roomId}</b></p>
                        </div>
                    )}
                    {players.length >= 2 && (
                        <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TicTacToe
                                socket={socket}
                                roomId={roomId || ''}
                                isMyTurn={gameState.turn === mySymbol}
                                mySymbol={mySymbol}
                                board={gameState.board}
                                winner={gameState.winner}
                                onMove={handleMove}
                                onReset={handleReset}
                            />
                        </div>
                    )}
                </div>

                {/* Players & Chat Container */}
                <div style={{ flex: 1, display: 'flex', gap: '1rem', flexDirection: 'row', maxHeight: '40%' }}>
                    <div className="glass-panel" style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
                        <h4 style={{ marginBottom: '0.5rem', position: 'sticky', top: 0 }}>Players ({players.length})</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {players.map(p => (
                                <div key={p.id} className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.8rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                    <img src={p.avatar} alt="av" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <span style={{ fontWeight: p.id === user?._id ? 'bold' : 'normal' }}>
                                            {p.username} {p.id === user?._id && '(You)'}
                                        </span>
                                    </div>
                                    {isMicOn && p.id === user?._id && <span style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>🎤</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel" style={{ flex: 1.5, padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                        <h4 style={{ marginBottom: '0.5rem' }}>Chat</h4>
                        <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', marginBottom: '0.5rem', borderRadius: '8px', padding: '0.5rem', overflowY: 'auto', fontSize: '0.9rem' }}>
                            {messages.map((m) => (
                                <div key={m.id} style={{ marginBottom: '0.5rem', breakInside: 'avoid' }}>
                                    {m.system ? (
                                        <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.8rem' }}>{m.text}</div>
                                    ) : (
                                        <div>
                                            <span style={{ fontWeight: 'bold', color: m.from === user?.username ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>{m.from}: </span>
                                            <span>{m.text}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Message..."
                                style={{ marginBottom: 0, padding: '0.5rem' }}
                                value={msgInput}
                                onChange={(e) => setMsgInput(e.target.value)}
                            />
                            <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Send</button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default GameRoom;
