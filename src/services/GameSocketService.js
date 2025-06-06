import { Server } from "socket.io";

let instance = null;

class GameSocketService {
  constructor(httpServer, corsOptions) {
    if (instance) {
      throw new Error("You can only create one instance of GameSocketService");
    }

    if (!httpServer) {
      throw new Error("httpServer is required");
    }

    this.io = new Server(httpServer, {
      cors: {
        origin: corsOptions.origin,
        methods: corsOptions.methods,
        credentials: corsOptions.credentials,
      },
      transports: ["websocket", "polling"],
      allowEIO3: true,
    });

    // Add connection logging
    this.io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });

      socket.on("error", (error) => {
        console.error("Socket error:", error);
      });
    });

    console.log("Socket server created");
  }

  getIOInstance() {
    return this.io;
  }

  emitToRoom(roomId, event, data) {
    this.io.to(roomId).emit(event, data);
  }

  emitToSocket(socketId, event, data) {
    this.io.to(socketId).emit(event, data);
  }

  broadcast(event, data) {
    this.io.emit(event, data);
  }
}

export function initializeSocketService(httpServer, corsOptions) {
  if (!instance) {
    instance = new GameSocketService(httpServer, corsOptions);
    console.log("Socket service initialized");
  } else {
    console.log("Socket service already initialized");
  }
  return instance;
}

export function getSocketServiceInstance() {
  if (!instance) {
    throw new Error("Socket service not initialized");
  }
  return instance;
}
