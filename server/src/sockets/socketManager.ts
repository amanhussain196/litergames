import { Server, Socket } from 'socket.io';

// Types
interface User {
    id: string; // MongoID (Stable)
    username: string;
    avatar: string;
    socketId: string;
    ready: boolean;
    roomId?: string; // The room they are currently in
}

interface ChatMessage {
    id: string;
    from: string;
    text: string;
    timestamp: string;
    system?: boolean; // For "User joined" messages
}

interface TicTacToeState {
    board: (string | null)[];
    turn: 'X' | 'O';
    winner: string | null;
}

interface Room {
    id: string;
    players: User[];
    messages: ChatMessage[];
    state: 'waiting' | 'playing';
    game: TicTacToeState; // Game State
}

// In-memory Store
const users: Record<string, User> = {};
const rooms: Record<string, Room> = {};

// Helper: Check Winner
const checkWinner = (board: (string | null)[]) => {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return board.includes(null) ? null : 'draw';
};

const socketManager = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log(`User connected: ${socket.id}`);

        // --- User Handling ---
        socket.on('user:join', (userData: { id: string; username: string; avatar: string }) => {
            // Improve: Handle re-connections if ID exists?
            users[socket.id] = {
                ...userData,
                socketId: socket.id,
                ready: false
            };

            console.log(`User registered: ${userData.username}`);
        });

        // --- Room Management ---
        socket.on('room:create', () => {
            const roomId = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6-char code
            const user = users[socket.id];

            if (!user) return;

            // Create Room
            rooms[roomId] = {
                id: roomId,
                players: [],
                messages: [],
                state: 'waiting',
                game: {
                    board: Array(9).fill(null),
                    turn: 'X',
                    winner: null
                }
            };

            console.log(`Room created: ${roomId} by ${user.username}`);
            socket.emit('room:created', roomId);
        });

        socket.on('room:join', ({ roomId }: { roomId: string }) => {
            // Normalize room ID
            const targetId = roomId.toUpperCase();
            const room = rooms[targetId];
            const user = users[socket.id];

            if (!room) {
                socket.emit('error', 'Room not found');
                return;
            }
            if (!user) {
                // Ideally should request re-auth or similar, but for now error
                socket.emit('error', 'User not authenticated');
                return;
            }

            // Check if already in room to prevent dups
            if (!room.players.find(p => p.id === user.id)) {
                user.roomId = targetId;
                user.ready = false;
                room.players.push(user);

                // System Message (Only for new joins)
                const sysMsg: ChatMessage = {
                    id: Date.now().toString(),
                    from: 'System',
                    text: `${user.username} joined the room.`,
                    timestamp: new Date().toISOString(),
                    system: true
                };
                // Only add if not duplicate/spam? simple for now
                room.messages.push(sysMsg);
                io.to(targetId).emit('chat:receive', sysMsg);
            } else {
                // Update socket ID mainly
                const p = room.players.find(p => p.id === user.id);
                if (p) p.socketId = socket.id;
            }

            socket.join(targetId);

            // Notify User
            socket.emit('room:joined', targetId);

            // Notify Room (Update Roster)
            io.to(targetId).emit('room:update', {
                players: room.players,
                state: room.state
            });

            // Send current game state
            socket.emit('game:update', room.game);

            // Send recent history
            socket.emit('chat:history', room.messages);



            console.log(`${user.username} joined room ${targetId}`);
        });

        // --- Game Logic (Tic-Tac-Toe) ---
        socket.on('game:move', ({ roomId, index }: { roomId: string, index: number }) => {
            const room = rooms[roomId];
            if (!room) return;

            const { board, turn, winner } = room.game;

            if (winner || board[index] !== null) return;

            // Find player symbol: Player 1 (Creator/First) is X, Player 2 is O
            // We use the stable ID to find index in the players array
            // (Assuming players array order is preserved, which it is for .push)
            const user = users[socket.id];
            if (!user) return;

            const playerIdx = room.players.findIndex(p => p.id === user.id);
            if (playerIdx === -1) return; // Not in room?

            const playerSymbol = playerIdx === 0 ? 'X' : 'O';

            if (playerSymbol !== turn) return; // Not your turn

            // Execute Move
            board[index] = turn;

            // Check Win
            const winResult = checkWinner(board);
            if (winResult) {
                room.game.winner = winResult;
            } else {
                // Switch Turn
                room.game.turn = turn === 'X' ? 'O' : 'X';
            }

            // Broadcast
            io.to(roomId).emit('game:update', room.game);
        });

        socket.on('game:reset', ({ roomId }) => {
            const room = rooms[roomId];
            if (!room) return;

            room.game = {
                board: Array(9).fill(null),
                turn: 'X', // Reset to X
                winner: null
            };
            io.to(roomId).emit('game:update', room.game);
        });


        socket.on('room:leave', () => {
            handleLeave(socket, io);
        });

        // --- Chat ---
        socket.on('chat:send', (payload: { text: string }) => {
            const user = users[socket.id];
            if (!user || !user.roomId) return;

            const room = rooms[user.roomId];
            if (!room) return;

            const msg: ChatMessage = {
                id: Date.now().toString(),
                from: user.username,
                text: payload.text,
                timestamp: new Date().toISOString()
            };

            room.messages.push(msg);
            io.to(user.roomId).emit('chat:receive', msg);
        });

        // --- Voice (WebRTC) ---
        socket.on('voice:signal', (payload: { targetId: string; signal: any }) => {
            io.to(payload.targetId).emit('voice:signal', {
                userId: users[socket.id]?.id,
                socketId: socket.id,
                signal: payload.signal
            });
        });

        // --- Disconnect ---
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
            handleLeave(socket, io);
            delete users[socket.id];
        });
    });
};

// Helper: Handle User Leaving
const handleLeave = (socket: Socket, io: Server) => {
    const user = users[socket.id];
    if (!user || !user.roomId) return;

    const roomId = user.roomId;
    const room = rooms[roomId];

    if (room) {
        // Remove player
        room.players = room.players.filter(p => p.id !== user.id);
        user.roomId = undefined;
        socket.leave(roomId); // Important

        // Notify remaining players
        io.to(roomId).emit('room:update', {
            players: room.players,
            state: room.state
        });

        const sysMsg: ChatMessage = {
            id: Date.now().toString(),
            from: 'System',
            text: `${user.username} left the room.`,
            timestamp: new Date().toISOString(),
            system: true
        };
        io.to(roomId).emit('chat:receive', sysMsg);

        // Cleanup empty room
        if (room.players.length === 0) {
            delete rooms[roomId];
            console.log(`Room ${roomId} deleted (empty).`);
        }
    }
};

export default socketManager;
