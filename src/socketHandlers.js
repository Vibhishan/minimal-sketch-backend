import {
  CREATE_ROOM,
  ROOM_CREATED,
  JOIN_ROOM,
  ROOM_JOINED,
  LEAVE_ROOM,
  ROOM_LEFT,
  PLAYER_JOINED,
  PLAYER_LEFT,
  ROOM_STATE_UPDATE,
  START_GAME,
  GAME_STARTED,
  ROUND_START,
  ROUND_END,
  TURN_START,
  TURN_END,
  GAME_END,
  SCORE_UPDATE,
  DRAW_EVENT,
  CLEAR_CANVAS,
  WORD_SELECTED,
  GUESS_WORD,
  WORD_GUESSED,
  SEND_MESSAGE,
  RECEIVE_MESSAGE,
  ERROR,
} from "./constants/webSocketEvents.js";

// Store active rooms and their states
const rooms = new Map();

export const setupSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Room Management
    socket.on(CREATE_ROOM, (data) => {
      const { playerName } = data;
      // Generate a random 6-character room code
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          players: new Map(),
          gameState: null,
          currentRound: 0,
          currentTurn: null,
        });
      }
      const room = rooms.get(roomId);
      room.players.set(socket.id, { name: playerName, score: 0 });

      socket.join(roomId);
      socket.emit(ROOM_CREATED, { roomId });
      io.to(roomId).emit(PLAYER_JOINED, { id: socket.id, playerName });
      io.to(roomId).emit(ROOM_STATE_UPDATE, getRoomState(roomId));
    });

    socket.on(JOIN_ROOM, (data) => {
      const { roomId, playerName } = data;
      if (!rooms.has(roomId)) {
        socket.emit(ERROR, { message: "Room does not exist" });
        return;
      }

      const room = rooms.get(roomId);
      room.players.set(socket.id, { name: playerName, score: 0 });

      socket.join(roomId);
      socket.emit(ROOM_JOINED, { roomId });
      io.to(roomId).emit(PLAYER_JOINED, { id: socket.id, playerName });
      io.to(roomId).emit(ROOM_STATE_UPDATE, getRoomState(roomId));
    });

    socket.on(LEAVE_ROOM, (data) => {
      const { roomId } = data;
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        const player = room.players.get(socket.id);

        if (player) {
          room.players.delete(socket.id);
          socket.leave(roomId);
          io.to(roomId).emit(PLAYER_LEFT, { playerName: player.name });

          if (room.players.size === 0) {
            rooms.delete(roomId);
          } else {
            io.to(roomId).emit(ROOM_STATE_UPDATE, getRoomState(roomId));
          }
        }
      }
    });

    // Game Flow
    socket.on(START_GAME, (data) => {
      const { roomId } = data;
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        room.gameState = "playing";
        room.currentRound = 1;
        const playerIds = Array.from(room.players.keys());
        room.currentTurn = playerIds[0];

        // Reset all scores to 0 when game starts
        room.players.forEach((player) => {
          player.score = 0;
        });

        // Emit to all players in the room
        io.to(roomId).emit(GAME_STARTED, {
          roomId,
          currentRound: 1,
          currentTurn: room.currentTurn,
        });
        io.to(roomId).emit(ROUND_START, { round: 1 });
        io.to(roomId).emit(TURN_START, { currentTurn: room.currentTurn });
        // Emit initial score update
        io.to(roomId).emit(SCORE_UPDATE, getRoomState(roomId));
      }
    });

    // Drawing Events
    socket.on(DRAW_EVENT, (data) => {
      const { roomId, senderId, strokes } = data;
      console.log("Received drawing event:", {
        roomId,
        senderId,
        strokeCount: strokes.length,
      });

      if (rooms.has(roomId)) {
        // Broadcast to all other clients in the room
        socket.to(roomId).emit(DRAW_EVENT, { senderId, strokes });
        console.log("Broadcast drawing event to room:", roomId);
      } else {
        console.warn("Room not found for drawing event:", roomId);
      }
    });

    socket.on(CLEAR_CANVAS, (data) => {
      const { roomId } = data;
      if (rooms.has(roomId)) {
        io.to(roomId).emit(CLEAR_CANVAS);
      }
    });

    // Word Events
    socket.on(WORD_SELECTED, (data) => {
      const { roomId, word } = data;
      io.to(roomId).emit(WORD_SELECTED, { word });
    });

    socket.on(GUESS_WORD, (data) => {
      const { roomId, word, playerName } = data;
      const room = rooms.get(roomId);
      if (room && room.currentWord === word) {
        const player = room.players.get(socket.id);
        if (player) {
          player.score += 10;
          io.to(roomId).emit(WORD_GUESSED, { playerName, word });
          // Emit score update after each correct guess
          io.to(roomId).emit(SCORE_UPDATE, getRoomState(roomId));
        }
      }
    });

    // Chat Events
    socket.on(SEND_MESSAGE, (data) => {
      const { roomId, message, playerName } = data;
      if (rooms.has(roomId)) {
        io.to(roomId).emit(RECEIVE_MESSAGE, { message, playerName });
      }
    });

    socket.on(TURN_END, (data) => {
      const { roomId } = data;
      const room = rooms.get(roomId);
      if (room) {
        const playerIds = Array.from(room.players.keys());
        const currentIndex = playerIds.indexOf(room.currentTurn);
        const nextIndex = (currentIndex + 1) % playerIds.length;
        room.currentTurn = playerIds[nextIndex];

        // Emit turn start and score update
        io.to(roomId).emit(TURN_START, { currentTurn: room.currentTurn });
        io.to(roomId).emit(SCORE_UPDATE, getRoomState(roomId));
      }
    });

    // Disconnect handling
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      // Find and leave all rooms the socket was in
      rooms.forEach((room, roomId) => {
        if (room.players.has(socket.id)) {
          const player = room.players.get(socket.id);
          room.players.delete(socket.id);
          io.to(roomId).emit(PLAYER_LEFT, { playerName: player.name });

          if (room.players.size === 0) {
            rooms.delete(roomId);
          } else {
            io.to(roomId).emit(ROOM_STATE_UPDATE, getRoomState(roomId));
          }
        }
      });
    });
  });
};

// Helper function to get room state
const getRoomState = (roomId) => {
  const room = rooms.get(roomId);
  if (!room) return null;

  return {
    players: Array.from(room.players.entries()).map(([id, player]) => ({
      id,
      name: player.name,
      score: player.score,
    })),
    gameState: room.gameState,
    currentRound: room.currentRound,
    currentTurn: room.currentTurn,
  };
};
