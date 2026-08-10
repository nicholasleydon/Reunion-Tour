// components/host/ScoreboardMeter.jsx
import React from 'react';

export default function ScoreboardMeter({ roomState }) {
  // Sort players by score, highest first
  const sortedPlayers = Array.from(roomState.players || []).sort(
    (a, b) => b.score - a.score
  );

  const WIN_CONDITION = 2000;
  const TOTAL_SEGMENTS = 25; // 25 LED blocks
  const POINTS_PER_SEGMENT = WIN_CONDITION / TOTAL_SEGMENTS; // 80 pts per segment

  return (
    <div className="relative min-h-screen bg-neutral-950 flex flex-col items-center justify-center font-mono overflow-hidden text-neutral-200 p-4">
      
      {/* Background Vignette */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,5,0.9)_80%,rgba(0,0,0,1)_100%)]" />

      {/* Hardware Rack UI Container */}
      <div className="relative z-10 w-full max-w-[950px] border-2 border-neutral-700 bg-neutral-900/95 backdrop-blur-md p-8 rounded-none shadow-[8px_8px_0px_0px_#D4FF00]">
        
        {/* Hardware Label / Header */}
        <div className="flex justify-between items-end border-b-2 border-neutral-700 pb-4 mb-8">
          <div>
            <h1 className="text-4xl font-black lowercase tracking-tighter text-white">master output.</h1>
            <p className="text-neutral-500 text-sm mt-1">session levels // round recap</p>
          </div>
          <div className="text-right">
            <p className="text-[#D4FF00] font-black text-xl animate-pulse">PEAK LIMIT: 2000 PTS</p>
          </div>
        </div>

        {/* Player Channels */}
        <div className="space-y-6">
          {sortedPlayers.map((player, index) => {
            const activeSegments = Math.min(
              Math.floor(player.score / POINTS_PER_SEGMENT), 
              TOTAL_SEGMENTS
            );

            return (
              <div key={player.id} className="flex items-center gap-4 group">
                
                {/* Channel Label & Avatar */}
                <div className="w-32 text-right flex items-center justify-end gap-2">
                  <span className="text-lg">{player.avatar?.icon || '🎸'}</span>
                  <div>
                    <p className="text-[10px] text-neutral-500 tracking-wider">CH 0{index + 1}</p>
                    <p className="text-base font-black uppercase text-white truncate max-w-[90px]">
                      {player.name}
                    </p>
                  </div>
                </div>

                {/* LED Volume Meter Bar */}
                <div className="flex-grow flex gap-1 h-8 bg-neutral-950 border border-neutral-800 p-1">
                  {[...Array(TOTAL_SEGMENTS)].map((_, i) => {
                    const isActive = i < activeSegments;
                    
                    // Meter Color Gradient:
                    // 0-14 (0-1120 pts): Green Signal
                    // 15-20 (1200-1600 pts): High-Vis Volt Yellow
                    // 21-25 (1680-2000 pts): Red Peak/Clipping
                    const isGreenZone = i < 15;
                    const isVoltZone = i >= 15 && i < 21;
                    const isRedZone = i >= 21;
                    
                    let ledClass = "bg-neutral-800/40"; // Off state
                    if (isActive) {
                      if (isRedZone) {
                        ledClass = "bg-red-600 shadow-[0_0_10px_#dc2626]"; // Clipping Red
                      } else if (isVoltZone) {
                        ledClass = "bg-[#D4FF00] shadow-[0_0_8px_rgba(212,255,0,0.6)]"; // High-Vis Volt
                      } else {
                        ledClass = "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"; // Signal Green
                      }
                    }

                    return (
                      <div 
                        key={i} 
                        className={`flex-1 h-full rounded-sm transition-all duration-300 ${ledClass}`}
                        style={{ transitionDelay: `${i * 25}ms` }} 
                      />
                    );
                  })}
                </div>

                {/* Digital Score Readout */}
                <div className="w-24 text-left border-l-2 border-neutral-700 pl-4">
                  <p className="text-[10px] text-neutral-500">LEVEL</p>
                  <p className={`text-xl font-black ${player.score >= 1680 ? 'text-red-500 animate-bounce' : player.score >= 1200 ? 'text-[#D4FF00]' : 'text-emerald-400'}`}>
                    {player.score.toString().padStart(4, '0')}
                  </p>
                </div>

              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center border-t-2 border-neutral-700 pt-4 flex justify-between items-center text-xs text-neutral-500">
          <p>SYSTEM STATUS: OK</p>
          <p className="lowercase animate-pulse text-[#D4FF00]">
            waiting for host to start next round...
          </p>
          <p>MODE: VU_METER_STEREO</p>
        </div>

      </div>
    </div>
  );
}