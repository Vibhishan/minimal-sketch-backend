import { DRAW_EVENT, CLEAR_CANVAS, ERROR } from "../events.js";

export const setupDrawHandlers = (io, socket) => {
  // Handle drawing events
  socket.on(DRAW_EVENT, (data) => {
    try {
      const { roomId, strokes } = data;
      // Broadcast drawing event to all other players in the room
      socket.to(roomId).emit(DRAW_EVENT, {
        strokes,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      socket.emit(ERROR, { message: error.message });
    }
  });

  // Handle canvas clearing
  socket.on(CLEAR_CANVAS, (data) => {
    try {
      const { roomId } = data;
      // Broadcast canvas clear to all players in the room
      io.to(roomId).emit(CLEAR_CANVAS, {
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      socket.emit(ERROR, { message: error.message });
    }
  });
};
