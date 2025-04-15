import http from "http";
import app from "./app.js";
import config from "./configs/index.js";
import { initializeSocketService } from "./services/GameSocketService.js";
import { initializeSockets } from "./sockets/index.js";

const httpServer = http.createServer(app);

const socketService = initializeSocketService(httpServer, config.corsOptions);
const io = socketService.getIOInstance();

initializeSockets(io);

httpServer.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
