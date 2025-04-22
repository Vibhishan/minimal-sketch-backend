import db from "../models/index.js";
import WordService from "./WordService.js";

class GameService {
  static async startGame(roomId) {
    try {
      const room = await db.Room.findByPk(roomId);
      if (!room) {
        throw new Error("Room not found");
      }

      if (room.status !== "waiting") {
        throw new Error("Game has already started");
      }

      // Get all players in the room
      const players = await db.RoomPlayer.findAll({
        where: { room_id: roomId },
        include: [{ model: db.User }],
      });

      if (players.length < 2) {
        throw new Error("Not enough players to start the game");
      }

      // Update room status
      await room.update({ status: "playing" });

      // Start first round
      await this.startRound(roomId);

      return room;
    } catch (error) {
      console.error("Error starting game:", error);
      throw error;
    }
  }

  static async startRound(roomId) {
    try {
      const room = await db.Room.findByPk(roomId);
      const players = await db.RoomPlayer.findAll({
        where: { room_id: roomId },
        include: [{ model: db.User }],
      });

      // Select a random player to draw
      const drawerIndex = Math.floor(Math.random() * players.length);
      const drawer = players[drawerIndex];

      // Select a random word
      const word = await WordService.getRandomWord();

      // Update room with current drawer and word
      await room.update({
        current_turn_drawer_user_id: drawer.user_id,
        current_word_id: word.id,
      });

      // Create a new turn
      const turn = await db.Turn.create({
        room_id: roomId,
        drawer_user_id: drawer.user_id,
        word_id: word.id,
        status: "drawing",
      });

      return {
        room,
        turn,
        drawer: drawer.User,
        word: word.word,
      };
    } catch (error) {
      console.error("Error starting round:", error);
      throw error;
    }
  }

  static async endTurn(roomId, correctGuesserId = null) {
    try {
      const room = await db.Room.findByPk(roomId);
      const currentTurn = await db.Turn.findOne({
        where: {
          room_id: roomId,
          status: "drawing",
        },
      });

      if (currentTurn) {
        await currentTurn.update({
          status: "completed",
          correct_guesser_user_id: correctGuesserId,
        });
      }

      // Update scores
      if (correctGuesserId) {
        await this.updateScores(
          roomId,
          currentTurn.drawer_user_id,
          correctGuesserId
        );
      }

      // Check if all rounds are completed
      const completedTurns = await db.Turn.count({
        where: {
          room_id: roomId,
          status: "completed",
        },
      });

      const totalRounds =
        room.settings.rounds *
        (await db.RoomPlayer.count({ where: { room_id: roomId } }));

      if (completedTurns >= totalRounds) {
        await this.endGame(roomId);
        return { gameEnded: true };
      }

      // Start next round
      return await this.startRound(roomId);
    } catch (error) {
      console.error("Error ending turn:", error);
      throw error;
    }
  }

  static async updateScores(roomId, drawerId, guesserId) {
    try {
      // Update drawer's score
      await db.RoomPlayer.increment("score", {
        by: 2,
        where: {
          room_id: roomId,
          user_id: drawerId,
        },
      });

      // Update guesser's score
      await db.RoomPlayer.increment("score", {
        by: 1,
        where: {
          room_id: roomId,
          user_id: guesserId,
        },
      });
    } catch (error) {
      console.error("Error updating scores:", error);
      throw error;
    }
  }

  static async endGame(roomId) {
    try {
      const room = await db.Room.findByPk(roomId);
      await room.update({ status: "finished" });

      // Get final scores
      const scores = await db.RoomPlayer.findAll({
        where: { room_id: roomId },
        include: [{ model: db.User }],
        order: [["score", "DESC"]],
      });

      return scores;
    } catch (error) {
      console.error("Error ending game:", error);
      throw error;
    }
  }
}

export default GameService;
