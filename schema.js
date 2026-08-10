// schema.js

const GamePhases = {
  LOBBY: 'LOBBY',
  CATEGORY_PICK: 'CATEGORY_PICK',
  SONG_SUBMIT: 'SONG_SUBMIT',
  MATCHING: 'MATCHING',
  TRIVIA: 'TRIVIA',
  REVEAL_STORY: 'REVEAL_STORY',
  SCORE_RECAP: 'SCORE_RECAP',
  GAME_OVER: 'GAME_OVER'
};

class Player {
  constructor(socketId, name) {
    this.id = socketId; // Primary identifier (can use session cookies for better reconnects)
    this.name = name;
    this.score = 0;
    this.connected = true; // For handling reconnects gracefully
    this.isVip = false; // First player to join can force-start the game
  }
}

class RoundState {
  constructor() {
    this.category = null; // e.g., "A song that reminds you of high school"
    this.activePlayerId = null; // Who is picking the category/answering trivia
    this.submissions = {}; // { playerId: { title, artist, url, story } }
    this.guesses = {}; // { playerId: { targetPlayerId: guessedSongId } }
    this.triviaData = null; // AI-generated trivia question
    this.storyVotes = {}; // { voterId: votedPlayerId }
  }
}

class Room {
  constructor(roomCode, hostSocketId) {
    this.roomCode = roomCode;
    this.hostSocketId = hostSocketId;
    this.status = GamePhases.LOBBY;
    this.players = new Map(); // Map of playerId -> Player
    this.currentRound = new RoundState();
    this.history = []; // Array of past RoundStates
    this.turnQueue = []; // Order of players for category picking/trivia
    this.winningScore = 1000;
  }
}

module.exports = { GamePhases, Player, RoundState, Room };