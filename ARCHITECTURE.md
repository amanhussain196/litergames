
# LiterGames Platform Architecture

## 1. System Overview
LiterGames is a mobile-first, multiplayer gaming platform supporting real-time chat, voice, and pluggable games. 
The system is divided into a frontend SPA (Client) and a backend Real-time API (Server).

## 2. Tech Stack
- **Frontend**: React (Vite) + TypeScript + Vanilla CSS
- **Backend**: Node.js + Express + Socket.IO + TypeScript
- **Database**: MongoDB (Mongoose)

## 3. Folder Structure
### Client (`/client`)
- `src/components`: UI building blocks (Buttons, Chat, Avatar).
- `src/context`: React Context for global state (Auth, Socket).
- `src/pages`: Main application views.
- `src/services`: API and Socket connectors.

### Server (`/server`)
- `src/models`: Database schemas (User, FriendRequest, Room).
- `src/sockets`: Real-time event handlers.
- `src/routes`: REST API endpoints (Auth).

## 4. API Contracts (REST)
### Auth
- `POST /api/auth/login` - Login/Register with Email or Guest.
- `GET /api/auth/me` - Get current user profile.

### Users
- `GET /api/users/:id` - Get public profile.
- `POST /api/users/friend-request` - Send friend request.
- `PUT /api/users/friend-request` - Accept/Reject.

## 5. WebSocket Events
### Connection
- `connection`: Client connects.
- `disconnect`: Client disconnects.

### Chat
- `chat:send` (client -> server): { to, message, type }
- `chat:receive` (server -> client): { from, message, timestamp }

### Room/Lobby
- `room:create` (client -> server): { config }
- `room:join` (client -> server): { roomId }
- `room:update` (server -> client): { players, state, config }
- `room:leave` (client -> server)

### Voice (WebRTC Signaling)
- `voice:offer`
- `voice:answer`
- `voice:candidate`

## 6. Data Models
### User
- `username`: string
- `email`: string (optional)
- `avatar`: string
- `status`: 'online' | 'offline' | 'playing'
- `friends`: string[] (User IDs)

### Room
- `code`: string (Unique ID)
- `players`: Array<{ userId, ready }>
- `gameType`: string (e.g., 'chess', 'none')
- `state`: 'waiting' | 'playing'

## 7. Game Plugin Interface
Each game implements:
```typescript
interface GamePlugin {
  name: string;
  minPlayers: number;
  maxPlayers: number;
  render: (container: HTMLElement, props: GameProps) => void;
  cleanup: () => void;
}
```
The platform provides `GameProps` containing `socket`, `roomId`, `playerId`.
