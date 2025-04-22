import { SEND_MESSAGE, RECEIVE_MESSAGE, ERROR } from "../events.js";

export const setupChatHandlers = (io, socket) => {
  // Handle sending messages
  socket.on(SEND_MESSAGE, (data) => {
    try {
      const { roomId, userId, message, username } = data;

      // Broadcast message to all players in the room
      io.to(roomId).emit(RECEIVE_MESSAGE, {
        userId,
        username,
        message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      socket.emit(ERROR, { message: error.message });
    }
  });
};
