# 🎨 Minimal Sketch (Backend)

A real-time multiplayer drawing and guessing game backend built with Node.js, Express, and Socket.IO.

## 📋 Overview

Minimal Sketch is an online pictionary game where players take turns drawing and guessing words. The backend provides real-time communication, game state management, and room-based multiplayer functionality.

## ✨ Features

### 🎮 Current Features

- Real-time multiplayer support using Socket.IO
- Room-based gameplay
- Turn-based drawing and guessing
- Real-time chat functionality
- Canvas synchronization
- Player management (join/leave)
- Game state management
- Socket.IO Admin UI for monitoring

### 🛠️ Technical Stack

- Node.js
- Express.js
- Socket.IO
- Sequelize (Database ORM)
- SQLite3 (Database)
- CORS support
- Environment-based configuration
- Socket.IO Admin UI for development

## 📁 Project Structure

```
src/
├── app.js              # Express application setup
├── server.js           # HTTP and Socket.IO server setup
├── socketHandlers.js   # Game logic and socket event handlers
├── configs/            # Configuration files
├── constants/          # Constants and enums
├── data/              # Data files (e.g., word database)
├── database/          # Database configuration
├── models/            # Database models
├── services/          # Business logic services
└── sockets/           # Socket-related utilities
```

## 🚀 Getting Started

### 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- SQLite3 (included in dependencies)

### ⚙️ Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Vibhishan/minimal-sketch-backend.git
   cd minimal-sketch-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```
   PORT=4000
   NODE_ENV=development
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   The server will start with nodemon for automatic reloading during development.

5. Access Socket.IO Admin UI:
   - Open your browser and navigate to `http://localhost:4000/admin`
   - This provides a visual interface to monitor and debug socket connections

## 💻 Development

The project uses the following development tools:

- `nodemon` for automatic server reloading during development
- `@socket.io/admin-ui` for monitoring socket connections

### 📜 Available Scripts

- `npm run dev` - Start the development server with hot reloading
- `npm test` - (To be implemented) Run test suite

## 🔌 API Endpoints

- `GET /health` - Health check endpoint

## 📡 Socket Events

The backend supports various socket events for real-time communication:

- Room Management:

  - `CREATE_ROOM`
  - `JOIN_ROOM`
  - `LEAVE_ROOM`
  - `ROOM_STATE_UPDATE`

- Game Flow:

  - `START_GAME`
  - `ROUND_START`
  - `TURN_START`
  - `TURN_END`
  - `GAME_END`

- Drawing & Guessing:

  - `DRAW_EVENT`
  - `CLEAR_CANVAS`
  - `WORD_SELECTED`
  - `GUESS_WORD`
  - `WORD_GUESSED`

- Chat:
  - `SEND_MESSAGE`
  - `RECEIVE_MESSAGE`

## 🔮 Future Features & Improvements

### 🎮 Gameplay Enhancements

- Word selection system
- Basic scoring mechanism
- Health check endpoint
- Round-based gameplay with multiple rounds per game
- Final scores display at game end
- Player ranking system with leaderboards
- Custom word suggestions from players
- Different game modes (e.g., speed drawing, team play)
- Power-ups and special abilities

### 🎨 Drawing Features

- More drawing tools (brush, spray, shapes)
- Undo/Redo functionality
- Background color selection
- Save and share drawings
- Drawing templates or stencils
- Layer support for complex drawings

### 👥 Social Features

- Player profiles and avatars
- Friend system and private rooms
- Emoji reactions to drawings
- Voice chat integration
- Spectator mode
- Replay system for past games

### ⚡ Technical Improvements

- Responsive design for all screen sizes
- Offline mode with local storage
- Performance optimizations for large rooms
- Better error handling and recovery
- Analytics and game statistics
- Dark mode support

### ♿ Accessibility

- Screen reader support
- Keyboard shortcuts
- High contrast mode
- Colorblind-friendly palette
- Adjustable font sizes
- Reduced motion options

### 🔒 Security & Moderation

- Report system for inappropriate content
- Word filtering and moderation
- Room password protection
- Anti-cheat measures
- User verification system
- Automated content moderation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Here's how you can contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure to:

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Keep your PR focused on a single feature or bug fix
