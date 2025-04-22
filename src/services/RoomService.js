import { v4 as uuidv4 } from "uuid";
import db from "../models/index.js";

class RoomService {
  static async createRoom(creatorId, settings = {}) {
    try {
      const room = await db.Room.create({
        id: uuidv4(),
        creator_user_id: creatorId,
        status: "waiting", // waiting, playing, finished
        settings: {
          maxPlayers: settings.maxPlayers || 8,
          roundDuration: settings.roundDuration || 60,
          rounds: settings.rounds || 3,
          ...settings,
        },
      });

      // Add creator as first player
      await db.RoomPlayer.create({
        room_id: room.id,
        user_id: creatorId,
        is_ready: true,
      });

      return room;
    } catch (error) {
      console.error("Error creating room:", error);
      throw error;
    }
  }

  static async joinRoom(roomId, userId) {
    try {
      const room = await db.Room.findByPk(roomId);
      if (!room) {
        throw new Error("Room not found");
      }

      if (room.status !== "waiting") {
        throw new Error("Game has already started");
      }

      const existingPlayer = await db.RoomPlayer.findOne({
        where: { room_id: roomId, user_id: userId },
      });

      if (existingPlayer) {
        return room;
      }

      await db.RoomPlayer.create({
        room_id: roomId,
        user_id: userId,
        is_ready: false,
      });

      return room;
    } catch (error) {
      console.error("Error joining room:", error);
      throw error;
    }
  }

  static async leaveRoom(roomId, userId) {
    try {
      const roomPlayer = await db.RoomPlayer.findOne({
        where: { room_id: roomId, user_id: userId },
      });

      if (roomPlayer) {
        await roomPlayer.destroy();
      }

      // If no players left, delete the room
      const remainingPlayers = await db.RoomPlayer.count({
        where: { room_id: roomId },
      });

      if (remainingPlayers === 0) {
        await db.Room.destroy({ where: { id: roomId } });
        return null;
      }

      return await db.Room.findByPk(roomId);
    } catch (error) {
      console.error("Error leaving room:", error);
      throw error;
    }
  }

  static async getRoomState(roomId) {
    try {
      const room = await db.Room.findByPk(roomId, {
        include: [
          {
            model: db.User,
            as: "Creator",
            attributes: ["id", "username"],
          },
          {
            model: db.User,
            as: "CurrentDrawer",
            attributes: ["id", "username"],
          },
          {
            model: db.Word,
            as: "CurrentWord",
            attributes: ["id", "word"],
          },
          {
            model: db.User,
            through: db.RoomPlayer,
            attributes: ["id", "username"],
          },
        ],
      });

      return room;
    } catch (error) {
      console.error("Error getting room state:", error);
      throw error;
    }
  }
}

export default RoomService;
