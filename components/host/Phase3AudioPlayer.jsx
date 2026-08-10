// components/host/Phase3AudioPlayer.jsx
import { useState, useEffect, useRef } from 'react';

export default function Phase3AudioPlayer({ roomState }) {
  const [playingIndex, setPlayingIndex] = useState(0);
  const audioRef = useRef(null);
  
  const tracks = roomState.currentRound.shuffledTracks || [];
  const currentTrack = tracks[playingIndex];

  useEffect(() => {
    // In a real app, this auto-plays the current track.
    // Browsers require user interaction first, which was achieved in the Lobby via the "Start Show" button.
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.previewUrl;
      audioRef.current.play().catch(e => console.log("Audio playback blocked", e));
    }
  }, [playingIndex, currentTrack]);

  const handleNextTrack = () => {
    if (playingIndex < tracks.length - 1) {
      setPlayingIndex(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-400 p-12 flex flex-col items-center justify-center font-sans">
      <div className="max-w-4xl w-full border-8 border-black bg-zinc-900 text-white p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
        
        <div className="text-center mb-12">
          <h2 className="text-5xl font-black uppercase text-pink-400 tracking-widest border-b-4 border-pink-400 pb-4 inline-block">
            Blind Playback
          </h2>
          <p className="text-xl font-mono mt-4 text-cyan-400">Guess whose vibe this is...</p>
        </div>

        {/* Retro Waveform Visualization */}
        <div className="h-48 bg-black border-4 border-zinc-700 flex items-end justify-center gap-2 p-4 overflow-hidden">
          {[...Array(24)].map((_, i) => (
            <div 
              key={i} 
              className="w-4 bg-cyan-400 animate-pulse origin-bottom"
              style={{ 
                height: `${Math.random() * 100}%`,
                animationDuration: `${0.2 + Math.random() * 0.5}s`
              }}
            ></div>
          ))}
        </div>

        <div className="mt-8 flex justify-between items-center font-mono">
          <span className="text-3xl font-black">TRACK 0{playingIndex + 1}</span>
          <span className="text-xl">OF 0{tracks.length}</span>
        </div>

        {/* Hidden Audio Element */}
        <audio ref={audioRef} onEnded={handleNextTrack} />

        {/* Host Controls */}
        <div className="mt-12 flex justify-center gap-6">
          <button 
            onClick={() => { if (audioRef.current) audioRef.current.play() }}
            className="bg-white text-black font-black uppercase py-2 px-6 border-4 border-white hover:bg-zinc-300"
          >
            Replay
          </button>
          <button 
            onClick={handleNextTrack}
            disabled={playingIndex === tracks.length - 1}
            className="bg-pink-400 text-black font-black uppercase py-2 px-6 border-4 border-pink-400 disabled:opacity-50"
          >
            Next Track
          </button>
        </div>

      </div>
    </div>
  );
}