// components/host/HostScreen.jsx
import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';
import { QRCodeSVG } from 'qrcode.react';
import ScoreboardMeter from './ScoreboardMeter';

const BACKGROUND_IMAGES = [
  '/bg-backstage.jpg',
  '/bg-stage-pov.jpg',
  '/bg-amps.jpg',
  '/bg-soundboard.jpg'
];

export default function HostScreen() {
  const [roomState, setRoomState] = useState(null);
  const [players, setPlayers] = useState([]);
  const [hostUrl, setHostUrl] = useState('');
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostUrl(window.location.origin);
    }

    const bgInterval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 15000);

    if (!socket.connected) {
      socket.connect();
    }
    socket.emit('host:createRoom');

    socket.on('host:roomCreated', (room) => {
      setRoomState(room);
    });

    socket.on('host:playerJoined', (player) => {
      setPlayers((prev) => [...prev, player]);
    });

    socket.on('room:stateUpdate', (room) => {
      setRoomState(room);
      if (room.players) setPlayers(room.players);
    });

    socket.on('room:phaseChanged', (room) => {
      setRoomState(room);
      if (room.players) setPlayers(room.players);
    });

    return () => {
      clearInterval(bgInterval);
      socket.off('host:roomCreated');
      socket.off('host:playerJoined');
      socket.off('room:stateUpdate');
      socket.off('room:phaseChanged');
    };
  }, []);

  if (!roomState) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-white font-mono text-2xl">
        Booting up stage...
      </div>
    );
  }

  // --- LOBBY PHASE (WITH HOW TO PLAY PANEL & QR CODE) ---
  if (roomState.status === 'LOBBY') {
    const joinLink = `${hostUrl}?room=${roomState.roomCode}`;

    return (
      <div 
        className="min-h-screen text-white p-8 font-mono flex flex-col items-center justify-center bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0.7)), url(${BACKGROUND_IMAGES[bgIndex]})`
        }}
      >
        <div className="w-full max-w-6xl border-2 border-amber-200/30 bg-zinc-900/90 p-8 rounded shadow-[8px_8px_0px_0px_#6b4c3e]">
          
          {/* Header & QR Code Section */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-6 border-b border-zinc-700 pb-6">
            <div>
              <h1 className="text-5xl font-black uppercase tracking-wider text-amber-100 mb-2">
                Reunion Tour
              </h1>
              <p className="text-zinc-400 text-sm">
                Join on your phone at:{' '}
                <span className="text-amber-300 font-bold">{hostUrl || 'Loading...'}</span>
              </p>
            </div>

            {/* Room Code & Scannable QR Code Box */}
            <div className="flex items-center gap-4 bg-[#6b4c3e] p-4 border-2 border-amber-200/30 rounded">
              <div className="text-center px-2">
                <p className="text-[10px] uppercase tracking-widest text-amber-200/70 font-mono">Room Code</p>
                <p className="text-5xl font-black text-amber-100 font-mono tracking-widest">{roomState.roomCode}</p>
              </div>

              {hostUrl && (
                <div className="bg-white p-2 rounded shadow-md">
                  <QRCodeSVG value={joinLink} size={90} level="M" />
                </div>
              )}
            </div>
          </div>

          {/* Quick Player Directions Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-zinc-800/80 p-4 border border-zinc-700 rounded text-xs text-zinc-300">
            <div>
              <p className="font-bold text-amber-300 uppercase mb-1">1. Join & Pick Vibe</p>
              <p>Scan QR code, enter name, and pick an instrument avatar[cite: 4, 8, 12]. Headliner picks prompt[cite: 1, 9].</p>
            </div>
            <div>
              <p className="font-bold text-amber-300 uppercase mb-1">2. Submit & Match</p>
              <p>Band submits 1 song per prompt[cite: 4, 10]. Headliner listens and guesses track owners[cite: 4, 6, 7].</p>
            </div>
            <div>
              <p className="font-bold text-amber-300 uppercase mb-1">3. Trivia & Backstory</p>
              <p>Headliner takes AI trivia[cite: 1, 4] and awards +100 bonus pts for the best backstory[cite: 1, 5]!</p>
            </div>
          </div>

          {/* Connected Player Cards */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs text-zinc-400 uppercase tracking-widest">
                BACKSTAGE PASSES ({players.length})
              </p>
              <p className="text-xs text-amber-300/80 italic">Need at least 2 players to start</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {players.length === 0 ? (
                <div className="col-span-4 text-center py-10 text-zinc-500 font-bold text-lg animate-pulse border border-dashed border-zinc-800 rounded">
                  Waiting for the band to get back together...
                </div>
              ) : (
                players.map((p, i) => (
                  <div key={i} className="border border-zinc-700 bg-zinc-800/90 p-4 flex flex-col items-center justify-center text-center rounded shadow-inner">
                    {p.avatar?.image ? (
                      <div className="w-14 h-14 bg-zinc-100 rounded-lg flex items-center justify-center p-2 mb-2 border-2 border-amber-300/40 shadow-sm">
                        <img 
                          src={p.avatar.image} 
                          alt={p.name} 
                          className="w-10 h-10 object-contain" 
                        />
                      </div>
                    ) : (
                      <div className="text-3xl mb-2">🎸</div>
                    )}
                    <p className="text-sm font-bold text-amber-100 truncate w-full">{p.name}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Start Game Trigger */}
          {players.length >= 2 && (
            <div className="mt-6 text-center">
              <button 
                onClick={() => socket.emit('host:startGame', { roomCode: roomState.roomCode })}
                className="bg-amber-400 text-zinc-950 text-xl font-black py-3 px-8 rounded border-2 border-amber-300 hover:bg-amber-300 hover:scale-105 transition-all uppercase tracking-wider inline-flex items-center justify-center gap-3 shadow-lg"
              >
                <span>Start The Show</span>
                <img src="/mic.png" alt="Mic" className="w-6 h-6 object-contain" />
              </button>
            </div>
          )}

        </div>
      </div>
    );
  }

  // --- PHASE 1: CATEGORY SELECTION ---
  if (roomState.status === 'CATEGORY_PICK') {
    const activePlayer = players.find(p => p.id === roomState.currentRound?.activePlayerId);

    return (
      <div 
        className="min-h-screen p-12 flex flex-col items-center justify-center font-mono text-white bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0.7)), url(${BACKGROUND_IMAGES[bgIndex]})`
        }}
      >
        <div className="text-center max-w-4xl w-full border-2 border-amber-200/30 bg-zinc-900/90 p-12 shadow-[8px_8px_0px_0px_#6b4c3e]">
          <h2 className="text-3xl font-black uppercase mb-8 text-amber-100">
            <span className="bg-[#6b4c3e] px-4 py-1 border border-amber-200/30 mr-4 text-amber-200">Setlist Picker</span>
            {activePlayer?.name || 'Someone'} is choosing the vibe...
          </h2>

          <div className="grid grid-cols-3 gap-6 mt-8">
            {(roomState.currentRound?.promptChoices || []).map((cat, idx) => (
              <div key={idx} className="h-56 border border-zinc-700 bg-zinc-800 p-6 flex flex-col items-center justify-center text-center rounded">
                <span className="text-xl font-black uppercase text-amber-300 mb-2">{cat.title}</span>
                <span className="text-xs text-zinc-300">{cat.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- SCORE RECAP PHASE (LED VOLUME METER) ---
  if (roomState.status === 'SCORE_RECAP') {
    return <ScoreboardMeter roomState={roomState} />;
  }

  return null;
}