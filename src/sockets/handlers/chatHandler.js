import { RECEIVE_EVENT } from "../events.js";

export const handleChatMessage = (io, socket, data) => {
  const { message, roomId } = data;
  console.log(`Message: ${message} sent to room: ${roomId}`);
  io.to(roomId).emit(RECEIVE_EVENT, message);
};
