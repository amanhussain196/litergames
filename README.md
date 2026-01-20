# LiterGames Platform (Phase 1)

**LiterGames** is a lightweight, mobile-first casual gaming platform featuring real-time chat, lobbies, and modular game capability.

## 🚀 Tech Stack
- **Frontend**: React (Vite) + TypeScript + Vanilla CSS (Glassmorphism UI)
- **Backend**: Node.js + Express + Socket.IO
- **Database**: MongoDB

## 📂 Project Structure
- `client/`: Frontend React application.
- `server/`: Backend API and WebSocket server.
- `ARCHITECTURE.md`: Detailed system design and API contracts.

## 🛠️ Setup & Running

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or cloud URI)

### 1. Backend Setup
```bash
cd server
npm install
# Create a .env file with MONGO_URI if needed (default: local)
npm run dev
```
Server runs on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Client runs on `http://localhost:5173`.

## ✨ Features (Phase 1)
- **User System**: Guest login with auto-generated avatars.
- **Lobby System**: Create and join rooms via code.
- **Real-Time**: Socket.IO integration for instant updates.
- **UI**: Mobile-first, responsive Glassmorphism design.

## 🔜 Next Steps
- Implement Friend System (Friend Requests, Status).
- Add Voice Chat (WebRTC).
- Integrate first game module.
