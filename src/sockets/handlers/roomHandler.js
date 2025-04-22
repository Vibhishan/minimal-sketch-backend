import RoomService from "../../services/RoomService.js";
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
  ERROR,
} from "../events.js";

export const setupRoomHandlers = (io, socket) => {
  // Create a new room
  socket.on(CREATE_ROOM, async (data) => {
    try {
      const { userId, settings } = data;
      const room = await RoomService.createRoom(userId, settings);

      // Join the socket room
      socket.join(room.id);

      // Send room created event to creator
      socket.emit(ROOM_CREATED, { roomId: room.id });

      // Get initial room state
      const roomState = await RoomService.getRoomState(room.id);

      // Send room state to creator
      socket.emit(ROOM_STATE_UPDATE, roomState);
    } catch (error) {
      socket.emit(ERROR, { message: error.message });
    }
  });

  // Join an existing room
  socket.on(JOIN_ROOM, async (data) => {
    try {
      const { roomId, userId } = data;
      const room = await RoomService.joinRoom(roomId, userId);

      // Join the socket room
      socket.join(roomId);

      // Send room joined event to joiner
      socket.emit(ROOM_JOINED, { roomId });

      // Get updated room state
      const roomState = await RoomService.getRoomState(roomId);

      // Notify all players in the room about the new player
      io.to(roomId).emit(PLAYER_JOINED, { userId });

      // Send updated room state to all players
      io.to(roomId).emit(ROOM_STATE_UPDATE, roomState);
    } catch (error) {
      socket.emit(ERROR, { message: error.message });
    }
  });

  // Leave a room
  socket.on(LEAVE_ROOM, async (data) => {
    try {
      const { roomId, userId } = data;
      const room = await RoomService.leaveRoom(roomId, userId);

      // Leave the socket room
      socket.leave(roomId);

      // Send room left event to leaver
      socket.emit(ROOM_LEFT, { roomId });

      if (room) {
        // Get updated room state
        const roomState = await RoomService.getRoomState(roomId);

        // Notify remaining players about the player who left
        io.to(roomId).emit(PLAYER_LEFT, { userId });

        // Send updated room state to remaining players
        io.to(roomId).emit(ROOM_STATE_UPDATE, roomState);
      }
    } catch (error) {
      socket.emit(ERROR, { message: error.message });
    }
  });
};
