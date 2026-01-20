import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import socketManager from './sockets/socketManager';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Database
connectDB();

// Routes
import authRoutes from './routes/authRoutes';
app.use('/api/auth', authRoutes);

// Socket.io
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for dev
        methods: ["GET", "POST"]
    }
});

socketManager(io);

// Basic Route
app.get('/', (req, res) => {
    res.send('LiterGames API is running...');
});

const startServer = (port: number) => {
    server.listen(port, () => {
        console.log(`Server running on port ${port}`);
    }).on('error', (e: any) => {
        if (e.code === 'EADDRINUSE') {
            console.log(`Port ${port} is in use, retrying with ${port + 1}...`);
            server.close();
            startServer(port + 1);
        } else {
            console.error(e);
        }
    });
};

const PORT = Number(process.env.PORT) || 5000;
startServer(PORT);
