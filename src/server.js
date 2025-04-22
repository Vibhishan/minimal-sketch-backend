import express from "express";
import http from "http";
import cors from "cors";
import { setupSocketHandlers } from "./socketHandlers.js";
import app from "./app.js";
import config from "./configs/index.js";
import { initializeSocketService } from "./services/GameSocketService.js";
import { initializeSockets } from "./sockets/index.js";
import db from "./models/index.js";

const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: config.corsOptions.origin,
    methods: config.corsOptions.methods,
    credentials: config.corsOptions.credentials,
  })
);
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

async function init() {
  const socketService = initializeSocketService(server, config.corsOptions);
  const io = socketService.getIOInstance();

  // Setup socket handlers
  setupSocketHandlers(io);
  initializeSockets(io);

  try {
    // In development, you might use sync (force: true drops tables!)
    // await db.sequelize.sync({ force: true }); // Caution! Deletes data!
    await db.sequelize.sync(); // Creates tables if they don't exist
    console.log("Database synchronized successfully.");

    server.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Unable to synchronize database:", error);
    process.exit(1); // Exit if DB sync fails
  }
}

init();
