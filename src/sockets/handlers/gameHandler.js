import GameService from "../../services/GameService.js";
import {
  START_GAME,
  GAME_STARTED,
  ROUND_START,
  ROUND_END,
  TURN_START,
  TURN_END,
  GAME_END,
  SCORE_UPDATE,
  ERROR,
} from "../events.js";

export const setupGameHandlers = (io, socket) => {
  // Start the game
  socket.on(START_GAME, async (data) => {
    try {
      const { roomId } = data;
      const room = await GameService.startGame(roomId);

      // Notify all players that game has started
      io.to(roomId).emit(GAME_STARTED, { roomId });

      // Get the first round details
      const roundDetails = await GameService.startRound(roomId);

      // Notify all players about the new round
      io.to(roomId).emit(ROUND_START, {
        drawer: roundDetails.drawer,
        duration: room.settings.roundDuration,
      });

      // Notify the drawer about their word
      io.to(roundDetails.drawer.id).emit(TURN_START, {
        word: roundDetails.word,
      });
    } catch (error) {
      socket.emit(ERROR, { message: error.message });
    }
  });

  // End the current turn
  socket.on(TURN_END, async (data) => {
    try {
      const { roomId, correctGuesserId } = data;
      const result = await GameService.endTurn(roomId, correctGuesserId);

      if (result.gameEnded) {
        // Game is over, get final scores
        const finalScores = await GameService.endGame(roomId);
        io.to(roomId).emit(GAME_END, { scores: finalScores });
      } else {
        // Start new round
        const roundDetails = await GameService.startRound(roomId);

        // Notify all players about the new round
        io.to(roomId).emit(ROUND_START, {
          drawer: roundDetails.drawer,
          duration: room.settings.roundDuration,
        });

        // Notify the drawer about their word
        io.to(roundDetails.drawer.id).emit(TURN_START, {
          word: roundDetails.word,
        });
      }
    } catch (error) {
      socket.emit(ERROR, { message: error.message });
    }
  });

  // Update scores
  socket.on(SCORE_UPDATE, async (data) => {
    try {
      const { roomId, drawerId, guesserId } = data;
      await GameService.updateScores(roomId, drawerId, guesserId);

      // Get updated room state with new scores
      const roomState = await RoomService.getRoomState(roomId);

      // Send updated scores to all players
      io.to(roomId).emit(SCORE_UPDATE, roomState);
    } catch (error) {
      socket.emit(ERROR, { message: error.message });
    }
  });
};
