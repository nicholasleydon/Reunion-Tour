// gameManager.js
const { GamePhases, Player, Room, RoundState } = require('./schema');

class GameManager {
  constructor() {
    this.rooms = new Map(); // roomCode -> Room
  }

  // Helper: Generate 4-letter code
  generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code;
    do {
      code = '';
      for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    } while (this.rooms.has(code));
    return code;
  }

  createRoom(hostSocketId) {
    const code = this.generateRoomCode();
    const room = new Room(code, hostSocketId);
    this.rooms.set(code, room);
    return room;
  }

  joinRoom(roomCode, socketId, playerName) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) throw new Error("Room not found");
    if (room.status !== GamePhases.LOBBY) {
      // Reconnect logic
      const existingPlayer = Array.from(room.players.values()).find(p => p.name === playerName);
      if (existingPlayer && !existingPlayer.connected) {
        existingPlayer.connected = true;
        existingPlayer.id = socketId; // Update to new socket
        return { room, player: existingPlayer, reconnected: true };
      }
      throw new Error("Game already in progress");
    }

    const player = new Player(socketId, playerName);
    if (room.players.size === 0) player.isVip = true;
    
    room.players.set(socketId, player);
    room.turnQueue.push(socketId);
    return { room, player, reconnected: false };
  }

  disconnectPlayer(socketId) {
    for (let [code, room] of this.rooms.entries()) {
      if (room.players.has(socketId)) {
        room.players.get(socketId).connected = false;
        // If everyone disconnects, you might want to schedule room deletion
        return room;
      }
    }
    return null;
  }

  // --- Phase Transitions ---

  setPhase(roomCode, phase) {
    const room = this.rooms.get(roomCode);
    if (!room) return null;
    room.status = phase;
    
    // Phase-specific setup
    if (phase === GamePhases.CATEGORY_PICK) {
      // Rotate turn queue
      const activePlayer = room.turnQueue.shift();
      room.turnQueue.push(activePlayer);
      room.currentRound.activePlayerId = activePlayer;
    }
    
    return room;
  }

  // --- Scoring Engine ---

  calculateScores(roomCode) {
    const room = this.rooms.get(roomCode);
    const round = room.currentRound;
    const numPlayers = room.players.size;
    
    let roundScores = {};
    for (let id of room.players.keys()) roundScores[id] = 0;

    // 1. Drag & Drop Matching (+100 match, +200 perfect sweep, +50 trickster)
    for (let [playerId, playerGuesses] of Object.entries(round.guesses)) {
      let correctGuesses = 0;
      
      for (let [guessedPlayerId, guessedSongId] of Object.entries(playerGuesses)) {
        const actualSubmitter = Object.keys(round.submissions).find(
          id => round.submissions[id].songId === guessedSongId
        );
        
        if (actualSubmitter === guessedPlayerId) {
          roundScores[playerId] += 100; // Correct match
          correctGuesses++;
        } else {
          // Trickster: Someone else guessed your song was theirs
          roundScores[actualSubmitter] += 50; 
        }
      }

      // Perfect Sweep (Guessed everyone else correctly)
      if (correctGuesses === numPlayers - 1) { // -1 because you don't guess yourself
        roundScores[playerId] += 200; 
      }
    }

    // 2. Trivia / Steal (+150) - Assuming triviaData tracks the winner
    if (round.triviaData && round.triviaData.winnerId) {
      roundScores[round.triviaData.winnerId] += 150;
    }

    // 3. Best Story Vote (+200)
    let voteCounts = {};
    for (let votedId of Object.values(round.storyVotes)) {
      voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
    }
    
    let maxVotes = 0;
    let storyWinners = [];
    for (let [id, count] of Object.entries(voteCounts)) {
      if (count > maxVotes) {
        maxVotes = count;
        storyWinners = [id];
      } else if (count === maxVotes) {
        storyWinners.push(id);
      }
    }
    // Award 200 to the winner(s)
    storyWinners.forEach(id => roundScores[id] += 200);

    // Apply scores to global state
    for (let [id, points] of Object.entries(roundScores)) {
      room.players.get(id).score += points;
    }

    // Check Win Condition
    let winner = null;
    for (let player of room.players.values()) {
      if (player.score >= room.winningScore) {
        if (!winner || player.score > winner.score) winner = player;
      }
    }

    // Cycle round
    room.history.push(room.currentRound);
    room.currentRound = new RoundState();

    return { updatedRoom: room, roundScores, winner };
  }
}

module.exports = new GameManager();