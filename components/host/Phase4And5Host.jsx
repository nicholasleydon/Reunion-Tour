// components/host/Phase4And5Host.jsx
import { useEffect, useState } from 'react';

export default function Phase4And5Host({ roomState, winner }) {
  const status = roomState.status;

  // --- TRIVIA PHASE ---
  if (status === 'TRIVIA') {
    const trivia = roomState.currentRound.triviaData;
    if (!trivia) {
      return (
        <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center font-mono">
          <h2 className="text-4xl animate-pulse">Generating Spotlight Trivia...</h2>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-cyan-400 p-12 flex flex-col items-center justify-center font-sans">
        <div className="max-w-4xl w-full border-8 border-black bg-white p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-pink-400 font-black text-3xl uppercase tracking-widest mb-6">
            SPOTLIGHT TRIVIA
          </h2>
          <p className="text-4xl font-black mb-12 leading-tight">{trivia.question}</p>
          
          <div className="grid grid-cols-2 gap-6">
            {trivia.options.map((opt, i) => {
              let btnColor = "bg-yellow-400 text-black";
              // Animation state when answered
              if (trivia.isAnswered) {
                if (i === trivia.correctIndex) btnColor = "bg-green-500 text-white";
                else if (i === trivia.pgAnsweredIndex) btnColor = "bg-red-500 text-white";
                else btnColor = "bg-zinc-300 text-zinc-500";
              }

              return (
                <div key={i} className={`border-4 border-black p-6 font-black text-2xl uppercase transition-colors duration-500 ${btnColor}`}>
                  {opt}
                </div>
              );
            })}
          </div>

          {trivia.isAnswered && (
            <div className="mt-8 border-t-4 border-black pt-8 text-center animate-fade-in-up">
              <p className="text-2xl font-bold bg-pink-200 inline-block px-4 py-2 border-4 border-black">
                {trivia.explanation}
              </p>
              <h3 className="text-4xl font-black uppercase mt-6">
                {trivia.winnerId === roomState.currentRound.activePlayerId ? 
                  "Guesser gets +150!" : 
                  "Submitter Steals +150!"}
              </h3>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- REVEAL / STORY PHASE ---
  if (status === 'REVEAL_STORY') {
    return (
      <div className="min-h-screen bg-pink-400 p-12 flex flex-col items-center justify-center font-sans">
         <div className="max-w-4xl w-full border-8 border-black bg-white p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] text-center">
            <h2 className="text-6xl font-black uppercase mb-8">Story Time</h2>
            <p className="text-3xl font-bold mb-12">
              Share your reasons for picking your tracks! The Guesser is voting for the Best Story on their phone (+200 pts).
            </p>
            <div className="animate-spin text-6xl">⏳</div>
         </div>
      </div>
    );
  }

  // --- SCORE RECAP PHASE ---
  if (status === 'SCORE_RECAP') {
    const sortedPlayers = Array.from(roomState.players.values()).sort((a, b) => b.score - a.score);

    return (
      <div className="min-h-screen bg-yellow-400 p-12 flex flex-col items-center font-sans">
        <h1 className="text-6xl font-black uppercase bg-black text-white px-8 py-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] mb-12">
          Leaderboard
        </h1>
        <div className="w-full max-w-3xl space-y-4">
          {sortedPlayers.map((player, idx) => (
            <div key={player.id} className="flex justify-between items-center bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-6">
                <span className="text-4xl font-black text-zinc-400">#{idx + 1}</span>
                <span className="text-4xl font-black uppercase">{player.name}</span>
              </div>
              <span className="text-4xl font-black text-pink-500">{player.score} <span className="text-xl text-black">PTS</span></span>
            </div>
          ))}
        </div>
        <p className="mt-12 text-2xl font-bold bg-white px-4 py-2 border-4 border-black">Next round starting soon...</p>
      </div>
    );
  }

  // --- GAME OVER PHASE ---
  if (status === 'GAME_OVER') {
    return (
      <div className="min-h-screen bg-black p-12 flex flex-col items-center justify-center font-sans text-white">
        <div className="text-center animate-bounce">
          <h1 className="text-8xl font-black text-yellow-400 uppercase tracking-tighter mb-4 drop-shadow-[0_5px_5px_rgba(255,0,128,0.8)]">
            TOUR COMPLETED
          </h1>
          <h2 className="text-5xl font-bold text-cyan-400 mb-12">
            Winner: <span className="text-white bg-pink-500 px-6 py-2 border-4 border-white">{winner.name}</span>
          </h2>
          <p className="text-3xl font-mono">Final Score: {winner.score} pts</p>
        </div>
      </div>
    );
  }

  return null;
}