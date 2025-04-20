import { JOIN_EVENT, SEND_EVENT, DRAW_EVENT } from "./events.js";
import { handleChatMessage } from "./handlers/chatHandler.js";
import { handleDrawEvent } from "./handlers/drawHandler.js";

export function initializeSockets(io) {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Room Events
    socket.on(JOIN_EVENT, (roomId) => {
      socket.join(roomId);
      console.log(`User with ID: ${socket.id} joined room: ${roomId}`);
    });

    // Chat Events
    socket.on(SEND_EVENT, (data) => {
      handleChatMessage(io, socket, data);
    });

    socket.on(DRAW_EVENT, (data) => {
      console.log(`Message sent: ${data.senderId} to room: ${data.strokes}`);

      handleDrawEvent(io, socket, data);
    });

    // Game Events (to be implemented)
    // socket.on(START_GAME, (data) => handleStartGame(io, socket, data));
    // socket.on(END_GAME, (data) => handleEndGame(io, socket, data));
    // socket.on(ROUND_START, (data) => handleRoundStart(io, socket, data));
    // socket.on(ROUND_END, (data) => handleRoundEnd(io, socket, data));
    // socket.on(GUESS_WORD, (data) => handleGuessWord(io, socket, data));
  });
}
