// EVENT NAMES
const JOIN_EVENT = "join_room";
const SEND_EVENT = "send_message";
const RECEIVE_EVENT = "receive_message";

export function initializeSockets(io) {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on(JOIN_EVENT, (roomId) => {
      console.log(typeof roomId);
      socket.join(roomId);
      console.log(`User with ID: ${socket.id} joined room: ${roomId}`);
    });

    socket.on(SEND_EVENT, (data) => {
      const { message, roomId } = data;
      console.log(typeof roomId);
      console.log(`Message: ${message} sent to room: ${roomId}`);
      io.to(roomId).emit(RECEIVE_EVENT, message);
    });
  });
}
