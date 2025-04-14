import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const PORT = 4000;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    origin: "https://admin.socket.io",
    methods: ["GET", "POST"],
  },
});

// EVENT NAMES
const JOIN_EVENT = "join_room";
const SEND_EVENT = "send_message";
const RECEIVE_EVENT = "receive_message";

io.on("connection", (socket) => {
  console.log(socket.id);

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

instrument(io, {
  auth: false,
  mode: "development",
  namespaceName: "/admin",
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
