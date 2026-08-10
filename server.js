const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const rooms = {};

// --- EXCLUSIVELY STORY-DRIVEN PROMPT BANK ---
const MASTER_PROMPT_BANK = [
  { 
    title: 'BODY MOVIN', 
    description: "Song that FORCES you to move. When was the last time this track physically hijacked your body, and what were you doing? (Created by Jason)" 
  },
  { 
    title: 'EAR WORM', 
    description: "Lyrical or Melodic Ear Worms you couldn't stop humming. What situation or environment burned this melody into your brain? (Created by Ninon)" 
  },
  { 
    title: 'CATAPULT', 
    description: "Songs that instantly catapult you back into a specific era of your life. What exact memory or snapshot does this drag you back to? (Created by Deepa)" 
  },
  { 
    title: 'CLAIMED', 
    description: "The first song that was truly yours. What was the physical setting—a bedroom, a car—when you claimed it as your own? (Created by Nicholas)" 
  },
  { 
    title: 'BETTER THAN THE ORIGINAL', 
    description: "Submit a cover you think beats the original. What's the story behind how you stumbled upon this version? (Created by Jason)" 
  },
  { 
    title: 'DINO REMINDER', 
    description: "A song that reminds you of a fellow Dinosaur Renaissance member. What shared memory or characteristic of theirs does this track capture? (Created by Ninon)" 
  },
  { 
    title: 'CREATIVE FUEL', 
    description: "A song that makes you feel like creating something. What project or moment of inspiration was fueled by this track? (Created by Deepa)" 
  },
  { 
    title: 'ADMISSION OF GUILT', 
    description: "A song or artist you expected to dislike but now love. What specific moment completely flipped your opinion? (Created by Nicholas)" 
  },
  { 
    title: 'UNIQUELY YOU', 
    description: "A song you love that is so starkly in your own niche taste that others might scratch their heads. When do you catch yourself listening to it? (Created by Jason)" 
  },
  { 
    title: 'MOMENT OF BEAUTY', 
    description: "A scrap of a song that brings a lump to your throat. What emotional experience or turning point is tied to this feeling? (Created by Deepa)" 
  },
  { 
    title: 'EVERGREEN', 
    description: "A track that has stayed with you through massive life changes and never lost its luster. What life phase were you in when it entered your life? (Created by Nicholas)" 
  },
  { 
    title: 'THE SALVES', 
    description: "A song that got you through something genuinely hard. What was happening in the background of your life while this played on repeat? (Created by Ninon)" 
  },
  { 
    title: 'HOW HAD I NEVER HEARD THIS?!', 
    description: "Your most recent discovery of a classic you somehow missed. Who played it for you or where were you when your mind was blown? (Created by Jason)" 
  },
  { 
    title: 'THE DINNER PARTY', 
    description: "The background atmosphere music for a dinner party you hosted. What meal were you cooking, and what was the vibe in the room? (Created by Deepa)" 
  },
  { 
    title: 'LEAST AMONG THE GREATEST', 
    description: "The one track you skip on an otherwise masterclass album. What memory do you have of discovering the album as a whole? (Created by Nicholas)" 
  },
  { 
    title: 'BLESS THE BRIDGE', 
    description: "A track with a bridge so soaring it makes the whole journey worth it. Can you recall a time you blasted this specifically to reach that exact moment? (Created by Ninon)" 
  },
  { 
    title: "WAIT, THAT WAS 'X'?!", 
    description: "A song from a band that sounds entirely unlike their usual style. What was your reaction the first time you realized who was playing? (Created by Jason)" 
  },
  { 
    title: 'SEE YOU NEVER', 
    description: "The ultimate track playing as you walk out on a terrible job or toxic situation forever. What situation inspired this exit song? (Created by Deepa)" 
  },
  { 
    title: 'MORE THAN A METRONOME', 
    description: "A song where real drums and human percussion steal the show. What live show or drumming performance first made you notice it? (Created by Nicholas)" 
  },
  { 
    title: 'SOLO & SIDE PROJECTS', 
    description: "A track from an artist's side project. What were you doing in your life when this side project dropped? (Created by Ninon)" 
  },
  { 
    title: 'REUNION TOUR COVER', 
    description: "A cover you'd want our group to perform if we went on a real reunion tour. What venue or road trip are we playing this at? (Created by Jason)" 
  },
  { 
    title: 'IN THE STUDIO', 
    description: "A song with an intimate, right-in-the-room feel. What late-night setting makes this track hit the absolute hardest? (Created by Deepa)" 
  },
  { 
    title: "IT'S ALIVE", 
    description: "A song you performed or witnessed live. Who was with you in the crowd, and how wild did things get? (Created by Nicholas)" 
  },
  { 
    title: 'I WANT IN', 
    description: "A song that makes you daydream about jumping on stage to play with them. Which instrument would you grab in that fantasy? (Created by Ninon)" 
  },
  { 
    title: "MOTHER'S MUSIC", 
    description: "Music your mother exposed you to that still sticks with you. What specific memory of her does this sound unlock? (Created by Jason)" 
  },
  { 
    title: 'NEVER WOULD I EVER', 
    description: "A track you love but would never play with your parents present. What story is behind your discovery of this secret favorite? (Created by Deepa)" 
  },
  { 
    title: 'HIDDEN IN PLAIN SIGHT', 
    description: "An overlooked, underappreciated track by one of your favorite artists. How long did it take you to find this hidden gem? (Created by Nicholas)" 
  },
  { 
    title: 'FEARLESS', 
    description: "Your ultimate walk-on song before a massive moment. What high-stakes situation did you face while listening to this? (Created by Ninon)" 
  },
  { title: 'NOSTALGIA TRIP', description: 'Life Flying By: Select a song that reminds you of a time in your life when time flew by. What is a specific memory from that fast-paced period?' },
  { title: 'SECRET ROTATION', description: 'Guilty Pleasure: Share a track you love in private. What is the funniest memory you have of getting caught listening to it?' },
  { title: 'MILES COVERED', description: 'Road Trip Memory: Choose a song tied to an unforgettable road trip. Who was in the car, and what went completely wrong or right on that drive?' },
  { title: 'AFTER HOURS', description: 'Late Night Confession: Select a track that soundtracked a late-night deep conversation. What secret or truth was shared while this was playing?' },
  { title: 'HIGH STAKES', description: 'Adrenaline Rush: Choose a song you listened to right before taking a terrifying risk or facing a major challenge. What was the outcome?' },
  { title: 'FLASH IN THE PAN', description: 'One-Hit Wonder: Pick a massive hit by an artist who vanished. Where were you when this song was everywhere, and how did it saturate your summer?' },
  { title: 'COMING OF AGE', description: 'Soundtrack of Youth: Select a song that feels like the credits rolling on your adolescence. What milestone were you crossing when you left it behind?' },
  { title: 'ACOUSTIC ESCAPE', description: 'Unplugged Memory: Share a stripped-down song that helped you decompress during a chaotic time. What physical space did you go to escape?' },
  { title: 'THE LAZY SUNDAY', description: 'Slow Mornings: Pick a mellow tune tied to a morning when you had absolute zero responsibilities. Who was sharing coffee or breakfast with you?' },
  { title: 'MENDING FENCES', description: 'Heartbreak Recovery: Choose the song that accompanied your recovery after a brutal fall-out. How long did it take before you could listen to it without wincing?' },
  { title: 'UNFORGETTABLE NIGHT OUT', description: 'Dancefloor Chaos: Share a track from a night of dancing that went completely off the rails. What ridiculous thing happened on the floor?' },
  { title: 'THE LOST TRACK', description: 'Recovered Memory: Pick a great song you completely forgot existed until a random trigger brought it roaring back. What unlocked the memory?' },
  { title: 'ALBUM OBSCURITY', description: 'The Deep Cut: Select an unheralded track off an old CD or cassette. Who introduced you to this deep cut, and how did you feel being in on the secret?' },
  { title: 'STORMY ISOLATION', description: 'Rainy Day Memory: Choose a song associated with being stuck indoors during a massive storm. What comfort food or activity got you through the day?' },
  { title: 'SUNSET MEMORIES', description: 'Golden Hour: Share a track that captures a specific golden hour outdoors. What milestone or summer romance was unfolding around you?' },
  { title: 'GUITAR HERO', description: 'The Shred: Pick a track with an unforgettable solo that you tried to mimic. What embarrassing attempt did you make at playing along?' },
  { title: 'LOW-END RESONANCE', description: 'Bassline Memory: Select a song whose bassline shook a room you were in. Whose sound system or car were you sitting in when you first felt it?' },
  { title: 'OUT IN THE WOODS', description: 'Bonfire Nights: Choose a song tied to a night around a campfire or outdoor gathering. Who brought the guitar or speaker?' },
  { title: 'SECOND WIND', description: 'Wall of Exhaustion: Share the song that pulled you out of physical or mental exhaustion when you wanted to quit. What project were you trying to finish?' },
  { title: 'UNFILTERED JOY', description: 'Pure Euphoria: Pick a song that instantly reminds you of a day when everything went right. What was the occasion?' },
  { title: 'SATURDAY RITUALS', description: 'Weekend Routine: Select the upbeat track that motivated you through domestic chores or weekend prep. What family tradition or roommate dynamic surrounded this?' },
  { title: 'VOCAL IMPACT', description: 'Chill-Inducing Voice: Choose a performance with vocals that gave you goosebumps. Where were you sitting when those notes hit you for the first time?' },
  { title: 'ROAR OF THE CROWD', description: 'Stadium Memories: Share a colossal track tied to a massive live concert or stadium event. How loud was the crowd around you?' },
  { title: 'STANDING YOUR GROUND', description: 'Defiant Moment: Pick a fiery track that gave you courage during a conflict or disagreement. What stance did you take?' },
  { title: 'BEAUTIFUL SADNESS', description: 'Sweet Melancholy: Select a track that captures a bittersweet goodbye. Who were you waving off or leaving behind?' },
  { title: 'CHILDHOOD AUDIO', description: 'Earliest Sounds: Share a song from your earliest memory of riding in the back seat of a family car. What scenery outside the window matches the song?' },
  { title: 'CITY LIGHTS', description: 'Midnight Escape: Choose a track for driving through a sleeping city under streetlights. Where were you sneaking out to go?' },
  { title: 'BREAKNECK SPEED', description: 'Full Throttle: Pick a high-tempo track tied to a moment of rushing against a tight deadline. Did you make it on time?' },
  { title: 'GRAND FINALE', description: 'Final Curtain: Select the ultimate closing track that felt like the end of an era in your life. What chapter were you closing?' }
];

// --- STRICTLY MUSIC TRIVIA GENERATOR (NO LETTER COUNTING) ---
async function generateScaledTrivia(song, roundIndex = 0) {
  const songTitle = song.title || '';
  const artistName = song.artist || 'Unknown Artist';
  const albumName = song.album || 'Unknown Album';
  
  let releaseYear = 1990;
  if (song.releaseDate) {
    const extracted = parseInt(song.releaseDate.substring(0, 4), 10);
    if (!isNaN(extracted) && extracted > 1950 && extracted <= 2026) {
      releaseYear = extracted;
    }
  }

  const formatOptions = (opts) => {
    return opts
      .sort(() => Math.random() - 0.5)
      .map((opt, i) => ({ ...opt, id: ['A', 'B', 'C', 'D'][i] }));
  };

  // Only real music history questions: Album, Decade, Release Year, or Era
  const questionTypes = ['ALBUM', 'DECADE', 'YEAR'];
  const chosenType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

  if (chosenType === 'ALBUM') {
    const options = formatOptions([
      { text: albumName, isCorrect: true },
      { text: 'Greatest Hits Collection', isCorrect: false },
      { text: 'Live from the Vault Sessions', isCorrect: false },
      { text: 'The Essential Masterpieces', isCorrect: false }
    ]);

    return {
      question: `Catalog Check: Which original studio project features the track "${songTitle}" by ${artistName}?`,
      options,
      correctOptionId: options.find(o => o.isCorrect).id,
      correctAnswerText: albumName
    };
  }

  if (chosenType === 'DECADE') {
    const decade = `${Math.floor(releaseYear / 10) * 10}s`;
    const wrongDecades = ['1970s', '1980s', '1990s', '2000s', '2010s'].filter(d => d !== decade).slice(0, 3);
    
    const options = formatOptions([
      { text: decade, isCorrect: true },
      { text: wrongDecades[0], isCorrect: false },
      { text: wrongDecades[1], isCorrect: false },
      { text: wrongDecades[2], isCorrect: false }
    ]);

    return {
      question: `Era Placement: During which decade was "${songTitle}" by ${artistName} unleashed?`,
      options,
      correctOptionId: options.find(o => o.isCorrect).id,
      correctAnswerText: decade
    };
  }

  const options = formatOptions([
    { text: String(releaseYear), isCorrect: true },
    { text: String(releaseYear - 3), isCorrect: false },
    { text: String(releaseYear + 2), isCorrect: false },
    { text: String(releaseYear - 5), isCorrect: false }
  ]);

  return {
    question: `Chronology: In what precise year was "${songTitle}" by ${artistName} officially released?`,
    options,
    correctOptionId: options.find(o => o.isCorrect).id,
    correctAnswerText: String(releaseYear)
  };
}

// --- PLAUSIBLE GENRE-BASED DECOY BOT (AVOIDS SAME ARTIST) ---
async function fetchRandomDecoy(submissions = []) {
  try {
    const genreTerms = ['Indie Rock', 'Alternative Rock', 'Soul Music', 'Synth Pop', 'Americana', 'Classic Folk', '90s Alternative'];
    let term = genreTerms[Math.floor(Math.random() * genreTerms.length)];

    // Ensure decoy artist is distinct from submitted player tracks
    const submittedArtists = submissions.map(s => (s.artist || '').toLowerCase());

    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=30`);
    const data = await res.json();
    
    if (data.results && data.results.length > 0) {
      const plausibleTracks = data.results.filter(track => {
        const lowerTitle = (track.trackName || '').toLowerCase();
        const lowerArtist = (track.artistName || '').toLowerCase();

        const isRemix = lowerTitle.includes('remix') || lowerTitle.includes('mix') || 
                        lowerTitle.includes('live') || lowerTitle.includes('karaoke') || 
                        lowerTitle.includes('version') || lowerTitle.includes('edit');
        
        const alreadySubmitted = submissions.some(s => s.title.toLowerCase() === lowerTitle);
        const isSameArtist = submittedArtists.includes(lowerArtist);
        
        return !isRemix && !alreadySubmitted && !isSameArtist;
      });

      if (plausibleTracks.length > 0) {
        const track = plausibleTracks[Math.floor(Math.random() * plausibleTracks.length)];
        return {
          id: `decoy-${track.trackId}`,
          title: track.trackName,
          artist: track.artistName,
          album: track.collectionName || 'Unknown Album',
          releaseDate: track.releaseDate,
          cover: track.artworkUrl100?.replace('100x100', '300x300'),
          previewUrl: track.previewUrl,
          isDecoy: true
        };
      }
    }
  } catch (err) {
    console.error('Error fetching iTunes decoy:', err);
  }
  
  return {
    id: 'decoy-fallback',
    title: 'Short Skirt / Long Jacket',
    artist: 'CAKE',
    album: 'Comfort Eagle',
    releaseDate: '2001-07-24T07:00:00Z',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a4/09/b3/a409b30c-5cc7-e04f-9e6b-67be04a39f60/00075596265727.jpg/300x300bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/91/97/ea/9197ea43-34e8-8bdf-ffaf-d71d36cfae24/mzaf_7820121111624647317.plus.aac.p.m4a',
    isDecoy: true
  };
}

function generateRoomCode() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });

  io.on('connection', (socket) => {
    socket.on('host:createRoom', () => {
      const roomCode = generateRoomCode();
      const newRoom = {
        roomCode,
        status: 'LOBBY',
        players: [],
        currentRoundIndex: 0,
        currentRound: null,
        usedPrompts: []
      };
      rooms[roomCode] = newRoom;
      socket.join(roomCode);
      socket.emit('room:created', newRoom);
    });

    socket.on('player:join', ({ roomCode, playerName, avatar }) => {
      const code = roomCode?.toUpperCase();
      const room = rooms[code];

      if (!room) {
        socket.emit('error', 'Room not found! Check your room code.');
        return;
      }

      const normalizedName = playerName.trim().toLowerCase();
      let existingPlayer = room.players.find(p => p.name.trim().toLowerCase() === normalizedName);

      if (existingPlayer) {
        const oldSocketId = existingPlayer.id;
        existingPlayer.id = socket.id;
        if (avatar) existingPlayer.avatar = avatar;

        if (room.currentRound) {
          if (room.currentRound.activePlayerId === oldSocketId) room.currentRound.activePlayerId = socket.id;
          if (room.currentRound.submissions && room.currentRound.submissions[oldSocketId]) {
            room.currentRound.submissions[socket.id] = room.currentRound.submissions[oldSocketId];
            delete room.currentRound.submissions[oldSocketId];
          }
          if (room.currentRound.guesses && room.currentRound.guesses[oldSocketId]) {
            room.currentRound.guesses[socket.id] = room.currentRound.guesses[oldSocketId];
            delete room.currentRound.guesses[oldSocketId];
          }
          if (room.currentRound.storyBonusPlayerId === oldSocketId) room.currentRound.storyBonusPlayerId = socket.id;
        }

        socket.join(code);
        socket.emit('player:joined', { player: existingPlayer, roomState: room });
        io.to(code).emit('room:stateUpdate', room);
      } else {
        const newPlayer = {
          id: socket.id,
          name: playerName.trim(),
          avatar: avatar || { name: 'guitar', icon: '🎸' },
          isVip: room.players.length === 0,
          score: 0
        };

        room.players.push(newPlayer);
        socket.join(code);
        socket.emit('player:joined', { player: newPlayer, roomState: room });
        io.to(code).emit('room:stateUpdate', room);
      }
    });

    socket.on('host:startGame', ({ roomCode }) => {
      const code = roomCode?.toUpperCase();
      const room = rooms[code];

      if (room && room.players.length >= 2) {
        if (room.status === 'SCORE_RECAP') {
          room.currentRoundIndex = (room.currentRoundIndex + 1) % room.players.length;
        } else {
          room.currentRoundIndex = 0;
        }

        const activePlayer = room.players[room.currentRoundIndex];

        room.usedPrompts = room.usedPrompts || [];
        const availablePrompts = MASTER_PROMPT_BANK.filter(
          p => !room.usedPrompts.includes(p.title)
        );

        const promptPool = availablePrompts.length >= 3 ? availablePrompts : MASTER_PROMPT_BANK;
        const shuffled = [...promptPool].sort(() => Math.random() - 0.5);
        const roundChoices = shuffled.slice(0, 3);

        room.status = 'CATEGORY_PICK';
        room.currentRound = {
          activePlayerId: activePlayer.id,
          category: null,
          promptChoices: roundChoices,
          submissions: {},
          guesses: {},
          selectedTriviaSong: null,
          triviaData: null,
          triviaUserAnswer: null,
          storyBonusPlayerId: null
        };

        io.to(code).emit('room:phaseChanged', room);
      }
    });

    socket.on('player:pickCategory', ({ roomCode, category }) => {
      const code = roomCode?.toUpperCase();
      const room = rooms[code];

      if (room && room.currentRound) {
        room.status = 'SONG_SUBMIT';
        room.currentRound.category = category;
        
        if (category && category.title) {
          room.usedPrompts = room.usedPrompts || [];
          if (!room.usedPrompts.includes(category.title)) {
            room.usedPrompts.push(category.title);
          }
        }

        io.to(code).emit('room:phaseChanged', room);
      }
    });

    socket.on('player:submitSong', async ({ roomCode, song }) => {
      const code = roomCode?.toUpperCase();
      const room = rooms[code];

      if (room && room.currentRound) {
        room.currentRound.submissions = room.currentRound.submissions || {};
        room.currentRound.submissions[socket.id] = song;

        // FIXED: Total required submissions = Total Players minus the 1 active prompt giver
        const requiredSubmissions = Math.max(1, room.players.length - 1);
        const currentSubmissionsCount = Object.keys(room.currentRound.submissions).length;

        if (currentSubmissionsCount >= requiredSubmissions) {
          // If only 1 track was submitted (e.g., 2 players total), inject the decoy track
          if (currentSubmissionsCount === 1) {
            const currentSubmissions = Object.values(room.currentRound.submissions);
            const freshDecoy = await fetchRandomDecoy(currentSubmissions);
            room.currentRound.submissions['DECOY_BOT'] = freshDecoy;
          }
          room.status = 'MATCHING';
        }

        io.to(code).emit('room:phaseChanged', room);
      }
    });

    socket.on('player:submitGuess', ({ roomCode, guesses }) => {
      const code = roomCode?.toUpperCase();
      const room = rooms[code];

      if (room && room.currentRound) {
        room.currentRound.guesses = room.currentRound.guesses || {};
        room.currentRound.guesses[socket.id] = guesses;

        room.status = 'TRIVIA_TIME';
        io.to(code).emit('room:phaseChanged', room);
      }
    });

    socket.on('player:selectTriviaSong', async ({ roomCode, songId }) => {
      const code = roomCode?.toUpperCase();
      const room = rooms[code];

      if (room && room.currentRound) {
        const submissions = Object.values(room.currentRound.submissions);
        const selectedSong = submissions.find(s => s.id === songId);

        if (selectedSong) {
          const triviaData = await generateScaledTrivia(selectedSong, room.currentRoundIndex || 0);
          room.currentRound.selectedTriviaSong = selectedSong;
          room.currentRound.triviaData = triviaData;
          
          io.to(code).emit('room:stateUpdate', room);
        }
      }
    });

    socket.on('player:submitTriviaAnswer', ({ roomCode, optionId }) => {
      const code = roomCode?.toUpperCase();
      const room = rooms[code];

      if (room && room.currentRound && room.currentRound.triviaData) {
        const isCorrect = optionId === room.currentRound.triviaData.correctOptionId;
        const guesser = room.players.find(p => p.id === room.currentRound.activePlayerId);

        if (isCorrect && guesser) {
          guesser.score += 50;
        }

        room.currentRound.triviaUserAnswer = {
          optionId,
          isCorrect,
          selectedText: room.currentRound.triviaData.options.find(o => o.id === optionId)?.text
        };

        io.to(code).emit('room:stateUpdate', room);
      }
    });

    socket.on('player:continueToStory', ({ roomCode }) => {
      const code = roomCode?.toUpperCase();
      const room = rooms[code];

      if (room) {
        room.status = 'STORY_TIME';
        io.to(code).emit('room:phaseChanged', room);
      }
    });

    socket.on('player:awardBestStory', ({ roomCode, bestPlayerId }) => {
      const code = roomCode?.toUpperCase();
      const room = rooms[code];

      if (room && room.currentRound) {
        room.currentRound.storyBonusPlayerId = bestPlayerId;

        const guesserId = room.currentRound.activePlayerId;
        const guesser = room.players.find(p => p.id === guesserId);
        const guesses = room.currentRound.guesses[guesserId] || {};

        Object.entries(guesses).forEach(([songId, guessedOwnerId]) => {
          const actualOwnerId = Object.keys(room.currentRound.submissions).find(
            sId => room.currentRound.submissions[sId].id === songId
          );

          if (actualOwnerId) {
            if (guessedOwnerId === actualOwnerId) {
              if (guesser) guesser.score += 100;
            } else {
              const actualOwner = room.players.find(p => p.id === actualOwnerId);
              if (actualOwner) actualOwner.score += 50;
            }
          }
        });

        if (bestPlayerId) {
          const bestPlayer = room.players.find(p => p.id === bestPlayerId);
          if (bestPlayer) bestPlayer.score += 100;
        }

        room.status = 'SCORE_RECAP';
        io.to(code).emit('room:phaseChanged', room);
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Reunion Tour Game Server running on port ${port}`);
  });
});