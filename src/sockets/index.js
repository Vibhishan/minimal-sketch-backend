import { Server } from "socket.io";
import { setupRoomHandlers } from "./handlers/roomHandler.js";
import { setupGameHandlers } from "./handlers/gameHandler.js";
import { setupDrawHandlers } from "./handlers/drawHandler.js";
import { setupWordHandlers } from "./handlers/wordHandler.js";
import { setupChatHandlers } from "./handlers/chatHandler.js";
import { setupSocketHandlers } from "../socketHandlers.js";

export const initializeSockets = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Setup all handlers
    setupRoomHandlers(io, socket);
    setupGameHandlers(io, socket);
    setupDrawHandlers(io, socket);
    setupWordHandlers(io, socket);
    setupChatHandlers(io, socket);

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  setupSocketHandlers(io);

  return io;
};
