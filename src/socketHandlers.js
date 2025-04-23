import {
  CREATE_ROOM,
  ROOM_CREATED,
  JOIN_ROOM,
  ROOM_JOINED,
  LEAVE_ROOM,
  ROOM_LEFT,
  PLAYER_JOINED,
  PLAYER_LEFT,
  ROOM_STATE_UPDATE,
  START_GAME,
  GAME_STARTED,
  ROUND_START,
  ROUND_END,
  TURN_START,
  TURN_END,
  GAME_END,
  SCORE_UPDATE,
  DRAW_EVENT,
  CLEAR_CANVAS,
  WORD_SELECTED,
  GUESS_WORD,
  WORD_GUESSED,
  SEND_MESSAGE,
  RECEIVE_MESSAGE,
  ERROR,
} from "./constants/webSocketEvents.js";
// Import from the database module instead of the words.js file
import { getRandomWord, getRandomWords } from "./data/wordDatabase.js";

// Store active rooms and their states
const rooms = new Map();

// Maximum number of rounds in a game
const MAX_ROUNDS = 3;

// Function to update all clients with the current game state
const updateAllClients = (io, roomId) => {
  const room = rooms.get(roomId);
  if (!room) return false;

  const state = getRoomState(roomId);

  // Send multiple event updates to ensure clients receive the information
  io.to(roomId).emit(ROOM_STATE_UPDATE, state);

  // If the game is active, also send specific game state updates
  if (room.gameState === "playing") {
    io.to(roomId).emit(ROUND_START, { round: room.currentRound });
    io.to(roomId).emit(TURN_START, {
      currentTurn: room.currentTurn,
      playerId: room.currentTurn,
    });
    io.to(roomId).emit(SCORE_UPDATE, state);
  }

  return true;
};

// Function to handle turn transitions
const handleTurnTransition = (io, roomId) => {
  const room = rooms.get(roomId);
  if (!room) {
    console.error(`Room ${roomId} not found in handleTurnTransition`);
    return false;
  }

  // Ensure we have ordered players
  if (!room.orderedPlayers || room.orderedPlayers.length === 0) {
    console.error(`No ordered players in room ${roomId}`);
    return false;
  }

  // Log the current state
  console.log(
    `Current turn: ${room.currentTurn}, Ordered players:`,
    room.orderedPlayers
  );

  // Find the current player's index in the ordered list
  const currentIndex = room.orderedPlayers.indexOf(room.currentTurn);
  if (currentIndex === -1) {
    console.error(
      `Current turn player ${room.currentTurn} not found in ordered list`
    );
    // Fallback to the first player
    room.currentTurn = room.orderedPlayers[0];
    return handleTurnTransition(io, roomId);
  }

  // Calculate the next player index
  const nextIndex = (currentIndex + 1) % room.orderedPlayers.length;

  // Log the transition
  console.log(
    `Turn transition: ${currentIndex} -> ${nextIndex} (${room.orderedPlayers.length} players total)`
  );

  // If we're going to loop back to the first player, increment the round
  if (nextIndex === 0) {
    room.currentRound += 1;
    console.log(`Starting round ${room.currentRound} for room ${roomId}`);

    // If we've reached the maximum number of rounds, end the game
    if (room.currentRound > MAX_ROUNDS) {
      console.log(`Max rounds (${MAX_ROUNDS}) reached, ending game`);
      endGame(io, roomId);
      return true;
    }

    // Send round start event explicitly with the new round number
    io.to(roomId).emit(ROUND_START, { round: room.currentRound });
  }

  // Set the next player as the current turn
  room.currentTurn = room.orderedPlayers[nextIndex];
  console.log(`Turn passed to player ${room.currentTurn} (index ${nextIndex})`);

  // Clear the canvas for the next turn
  io.to(roomId).emit(CLEAR_CANVAS);

  // Clear the current word and reset correct guessers
  room.currentWord = null;
  room.correctGuessers.clear();

  // Generate a new random word for this turn
  const suggestedWord = getRandomWord();
  console.log(`Selected word for player ${room.currentTurn}: ${suggestedWord}`);

  // Add a slight delay to ensure smooth transition
  setTimeout(() => {
    // First, send turn start to all players
    io.to(roomId).emit(TURN_START, {
      currentTurn: room.currentTurn,
      playerId: room.currentTurn,
    });

    // Then, send the word only to the drawer
    io.to(room.currentTurn).emit(WORD_SELECTED, {
      word: suggestedWord,
      isDrawer: true,
    });

    // Send null word to all other players to ensure word is cleared
    room.orderedPlayers.forEach((playerId) => {
      if (playerId !== room.currentTurn) {
        io.to(playerId).emit(WORD_SELECTED, {
          word: null,
          isDrawer: false,
        });
      }
    });

    // Always send updated scores and room state
    io.to(roomId).emit(SCORE_UPDATE, getRoomState(roomId));
    io.to(roomId).emit(ROOM_STATE_UPDATE, getRoomState(roomId));
  }, 500);

  return true;
};

// Function to end the game and determine the winner
const endGame = (io, roomId) => {
  const room = rooms.get(roomId);
  if (!room) return false;

  // Find the player with the highest score
  let highestScore = -1;
  let winner = null;

  room.players.forEach((player, playerId) => {
    if (player.score > highestScore) {
      highestScore = player.score;
      winner = {
        id: playerId,
        name: player.name,
        score: player.score,
      };
    }
  });

  room.gameState = "ended";

  // Emit game end event with the winner
  io.to(roomId).emit(GAME_END, {
    winner,
    finalScores: Array.from(room.players.entries()).map(([id, player]) => ({
      id,
      name: player.name,
      score: player.score,
    })),
  });

  return true;
};

export const setupSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Room Management
    socket.on(CREATE_ROOM, (data) => {
      const { playerName } = data;
      // Generate a random 6-character room code
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          players: new Map(),
          orderedPlayers: [], // Track player order based on join time
          gameState: null,
          currentRound: 0,
          currentTurn: null,
          currentWord: null,
          correctGuessers: new Set(),
        });
      }
      const room = rooms.get(roomId);
      room.players.set(socket.id, {
        name: playerName,
        score: 0,
        joinTime: Date.now(),
      });
      room.orderedPlayers.push(socket.id); // Add to ordered list

      socket.join(roomId);
      socket.emit(ROOM_CREATED, { roomId });
      io.to(roomId).emit(PLAYER_JOINED, { id: socket.id, playerName });
      io.to(roomId).emit(ROOM_STATE_UPDATE, getRoomState(roomId));
    });

    socket.on(JOIN_ROOM, (data) => {
      const { roomId, playerName } = data;
      if (!rooms.has(roomId)) {
        socket.emit(ERROR, { message: "Room does not exist" });
        return;
      }

      const room = rooms.get(roomId);
      room.players.set(socket.id, {
        name: playerName,
        score: 0,
        joinTime: Date.now(),
      });
      room.orderedPlayers.push(socket.id); // Add to ordered list

      socket.join(roomId);
      socket.emit(ROOM_JOINED, { roomId });
      io.to(roomId).emit(PLAYER_JOINED, { id: socket.id, playerName });
      io.to(roomId).emit(ROOM_STATE_UPDATE, getRoomState(roomId));
    });

    socket.on(LEAVE_ROOM, (data) => {
      const { roomId } = data;
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        const player = room.players.get(socket.id);

        if (player) {
          room.players.delete(socket.id);
          // Also remove from ordered players list
          room.orderedPlayers = room.orderedPlayers.filter(
            (id) => id !== socket.id
          );

          socket.leave(roomId);
          io.to(roomId).emit(PLAYER_LEFT, {
            id: socket.id,
            playerName: player.name,
          });

          if (room.players.size === 0) {
            rooms.delete(roomId);
          } else {
            // If the current drawer left, move to the next player
            if (
              room.currentTurn === socket.id &&
              room.gameState === "playing"
            ) {
              handleTurnTransition(io, roomId);
            }
            io.to(roomId).emit(ROOM_STATE_UPDATE, getRoomState(roomId));
          }
        }
      }
    });

    // Game Flow
    socket.on(START_GAME, (data) => {
      const { roomId } = data;
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);

        // Log player information before starting
        console.log(`Starting game for room ${roomId}:`, {
          playerCount: room.orderedPlayers.length,
          players: Array.from(room.players.entries()).map(([id, player]) => ({
            id,
            name: player.name,
          })),
        });

        room.gameState = "playing";
        room.currentRound = 1;
        room.correctGuessers = new Set();

        // Reset all scores to 0 when game starts
        room.players.forEach((player) => {
          player.score = 0;
        });

        // Ensure we have an ordered players list
        if (!room.orderedPlayers || room.orderedPlayers.length === 0) {
          console.warn(
            `No ordered players in room ${roomId}, rebuilding list from players map`
          );
          room.orderedPlayers = Array.from(room.players.keys());
        }

        // Use the first player in the ordered list (earliest to join)
        room.currentTurn = room.orderedPlayers[0];
        console.log(
          `First drawer will be ${room.currentTurn} (first in ordered list)`
        );

        // Generate a random word
        const suggestedWord = getRandomWord();
        console.log(`Selected word: ${suggestedWord}`);

        // Emit to all players in the room
        io.to(roomId).emit(GAME_STARTED, {
          roomId,
          currentRound: 1,
          currentTurn: room.currentTurn,
          maxRounds: MAX_ROUNDS,
        });

        // Emit the round start event with the explicit round number
        io.to(roomId).emit(ROUND_START, { round: 1 });

        io.to(roomId).emit(TURN_START, {
          currentTurn: room.currentTurn,
          playerId: room.currentTurn,
        });

        // Send the suggested word only to the drawer
        io.to(room.currentTurn).emit(WORD_SELECTED, {
          word: suggestedWord,
          isDrawer: true,
        });

        // Emit initial score update
        io.to(roomId).emit(SCORE_UPDATE, getRoomState(roomId));

        // Make sure the room state is updated
        io.to(roomId).emit(ROOM_STATE_UPDATE, getRoomState(roomId));
      }
    });

    // Drawing Events
    socket.on(DRAW_EVENT, (data) => {
      const { roomId, senderId, strokes } = data;
      console.log("Received drawing event:", {
        roomId,
        senderId,
        strokeCount: strokes.length,
      });

      if (rooms.has(roomId)) {
        // Broadcast to all other clients in the room
        socket.to(roomId).emit(DRAW_EVENT, { senderId, strokes });
        console.log("Broadcast drawing event to room:", roomId);
      } else {
        console.warn("Room not found for drawing event:", roomId);
      }
    });

    socket.on(CLEAR_CANVAS, (data) => {
      const { roomId } = data;
      if (rooms.has(roomId)) {
        io.to(roomId).emit(CLEAR_CANVAS);
      }
    });

    // Word Events
    socket.on(WORD_SELECTED, (data) => {
      const { roomId, word } = data;
      console.log(`Word selected for room ${roomId}: ${word}`);

      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        room.currentWord = word;
        // Reset the set of correct guessers when a new word is selected
        room.correctGuessers = new Set();
        // Only the current drawer (who selected the word) knows what it is
        io.to(room.currentTurn).emit(WORD_SELECTED, { word, isDrawer: true });
      }
    });

    socket.on(GUESS_WORD, (data) => {
      const { roomId, word, playerName } = data;
      const room = rooms.get(roomId);

      if (!room) return;

      // Normalize the guessed word and the current word for comparison
      const normalizedGuess = word.trim().toLowerCase();
      const normalizedCurrentWord = room.currentWord
        ? room.currentWord.trim().toLowerCase()
        : "";

      // Don't allow the drawer to guess
      if (socket.id === room.currentTurn) return;

      // Don't allow players who already guessed correctly to guess again
      if (room.correctGuessers.has(socket.id)) return;

      if (normalizedGuess === normalizedCurrentWord) {
        // Correct guess!
        const player = room.players.get(socket.id);
        if (player) {
          // Add points - more points for guessing earlier
          const pointsAwarded =
            10 + 5 * (1 - room.correctGuessers.size / (room.players.size - 1));
          player.score += Math.floor(pointsAwarded);

          // Also award points to the drawer
          const drawer = room.players.get(room.currentTurn);
          if (drawer) {
            drawer.score += 5;
          }

          // Add this player to the set of correct guessers
          room.correctGuessers.add(socket.id);

          // Let everyone know someone guessed correctly
          io.to(roomId).emit(WORD_GUESSED, { playerName, correct: true });

          // Let this player know what the word was
          socket.emit(WORD_SELECTED, {
            word: room.currentWord,
            isGuesser: true,
          });

          // Update scores
          io.to(roomId).emit(SCORE_UPDATE, getRoomState(roomId));

          // If everyone has guessed, end the turn early
          if (room.correctGuessers.size === room.players.size - 1) {
            // all except drawer
            handleTurnTransition(io, roomId);
          }
        }
      } else {
        // Incorrect guess - let everyone know
        io.to(roomId).emit(WORD_GUESSED, {
          playerName,
          correct: false,
          guess: word,
        });
      }
    });

    // Chat Events
    socket.on(SEND_MESSAGE, (data) => {
      const { roomId, message, playerName } = data;
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);

        // Special handling for chat messages that might be guesses
        if (
          room &&
          room.gameState === "playing" &&
          socket.id !== room.currentTurn
        ) {
          // Check if this is a potential guess
          const normalizedMessage = message.trim().toLowerCase();
          const normalizedCurrentWord = room.currentWord
            ? room.currentWord.trim().toLowerCase()
            : "";

          if (normalizedMessage === normalizedCurrentWord) {
            // This is a guess - handle it through the GUESS_WORD flow instead
            socket.emit(GUESS_WORD, { roomId, word: message, playerName });
            return;
          }
        }

        // Regular chat message
        io.to(roomId).emit(RECEIVE_MESSAGE, { message, playerName });
      }
    });

    socket.on(TURN_END, (data) => {
      const { roomId } = data;
      console.log("Turn ended for room:", roomId);

      // Get the room and log current state before transition
      const room = rooms.get(roomId);
      if (!room) {
        console.error(`Turn end called for non-existent room: ${roomId}`);
        return;
      }

      console.log(`Room ${roomId} state before transition:`, {
        currentRound: room.currentRound,
        currentTurn: room.currentTurn,
        playerCount: room.orderedPlayers.length,
        players: Array.from(room.players.keys()),
        nextPlayerWillBeIndex:
          (room.orderedPlayers.indexOf(room.currentTurn) + 1) %
          room.orderedPlayers.length,
        roundWillIncrement:
          (room.orderedPlayers.indexOf(room.currentTurn) + 1) %
            room.orderedPlayers.length ===
          0,
      });

      // Perform the turn transition
      const result = handleTurnTransition(io, roomId);

      // After transition, make sure all clients are fully updated
      if (result && rooms.has(roomId)) {
        const updatedRoom = rooms.get(roomId);
        // Add a small delay to ensure the transition is complete
        setTimeout(() => {
          // Explicitly update all clients with the current state
          updateAllClients(io, roomId);
        }, 1000);

        // Log the state after transition
        console.log(`Room ${roomId} state after transition:`, {
          currentRound: updatedRoom.currentRound,
          currentTurn: updatedRoom.currentTurn,
          playerCount: updatedRoom.orderedPlayers.length,
          players: Array.from(updatedRoom.players.keys()),
        });
      } else {
        console.error(`Turn transition failed for room ${roomId}`);
      }
    });

    // Disconnect handling
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      // Find and leave all rooms the socket was in
      rooms.forEach((room, roomId) => {
        if (room.players.has(socket.id)) {
          const player = room.players.get(socket.id);
          const wasCurrentTurn = room.currentTurn === socket.id;

          console.log(
            `Player ${socket.id} (${player.name}) disconnected from room ${roomId}`
          );

          // Remove player from map and ordered list
          room.players.delete(socket.id);
          room.orderedPlayers = room.orderedPlayers.filter(
            (id) => id !== socket.id
          );

          io.to(roomId).emit(PLAYER_LEFT, {
            id: socket.id,
            playerName: player.name,
          });

          // Handle empty room
          if (room.players.size === 0) {
            console.log(`Room ${roomId} is now empty, removing`);
            rooms.delete(roomId);
          } else {
            // If the current drawer left, move to the next player
            if (wasCurrentTurn && room.gameState === "playing") {
              console.log(
                `Current drawer disconnected, transitioning to next player`
              );
              handleTurnTransition(io, roomId);
            } else {
              // Just update room state
              io.to(roomId).emit(ROOM_STATE_UPDATE, getRoomState(roomId));
            }
          }
        }
      });
    });
  });
};

// Helper function to get room state
const getRoomState = (roomId) => {
  const room = rooms.get(roomId);
  if (!room) return null;

  // Log all room state for debugging
  console.log(`Getting state for room ${roomId}:`, {
    currentRound: room.currentRound,
    currentTurn: room.currentTurn,
    playerCount: room.orderedPlayers.length,
    gameState: room.gameState,
  });

  return {
    players: Array.from(room.players.entries()).map(([id, player]) => ({
      id,
      name: player.name,
      score: player.score,
    })),
    gameState: room.gameState,
    currentRound: room.currentRound,
    currentTurn: room.currentTurn,
    maxRounds: MAX_ROUNDS,
    totalPlayers: room.orderedPlayers.length,
  };
};
