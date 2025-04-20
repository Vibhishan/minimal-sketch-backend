import { DRAW_EVENT } from "../events.js";

export const handleDrawEvent = (io, socket, data) => {
  const { senderId, roomId, strokes } = data;
  console.log(`Strokes: ${strokes} sent to room: ${roomId}`);
  io.to(roomId).emit(DRAW_EVENT, { senderId, strokes });
};
