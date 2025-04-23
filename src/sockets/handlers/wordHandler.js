import WordService from "../../services/WordService.js";
import { WORD_SELECTED, GUESS_WORD, WORD_GUESSED, ERROR } from "../events.js";

export const setupWordHandlers = (io, socket) => {
  // Handle word selection
  socket.on(WORD_SELECTED, async (data) => {
    try {
      const { roomId, word } = data;
      // Store the selected word in the room
      await WordService.addWord(word);

      // Only send the word to the current drawer
      io.to(socket.id).emit(WORD_SELECTED, {
        word,
        isDrawer: true,
      });

      // Send null word to all other players
      const room = io.sockets.adapter.rooms.get(roomId);
      if (room) {
        room.forEach((playerId) => {
          if (playerId !== socket.id) {
            io.to(playerId).emit(WORD_SELECTED, {
              word: null,
              isDrawer: false,
            });
          }
        });
      }
    } catch (error) {
      socket.emit(ERROR, { message: error.message });
    }
  });

  // Handle word guessing
  socket.on(GUESS_WORD, async (data) => {
    try {
      const { roomId, userId, guess } = data;
      // Get the current word for the room
      const currentWord = await WordService.getCurrentWord(roomId);

      if (currentWord && guess.toLowerCase() === currentWord.toLowerCase()) {
        // Correct guess
        io.to(roomId).emit(WORD_GUESSED, {
          userId,
          word: currentWord,
        });

        // Trigger turn end with correct guesser
        socket.emit("turn_end", { roomId, correctGuesserId: userId });
      }
    } catch (error) {
      socket.emit(ERROR, { message: error.message });
    }
  });
};
