// components/mobile/Phase4StoryTrivia.jsx
import { useState } from 'react';

export default function Phase4StoryTrivia({ roomCode, socket, roomState }) {
  const [bonusPoints, setBonusPoints] = useState({});
  const currentRound = roomState?.currentRound || {};
  const isPromptGiver = currentRound.activePlayerId === socket?.id;

  const nonPromptPlayers = (roomState?.players || []).filter(
    (p) => p.id !== currentRound.activePlayerId
  );

  const handlePointChange = (playerId, amount) => {
    setBonusPoints((prev) => ({
      ...prev,
      [playerId]: Math.max(0, (prev[playerId] || 0) + amount)
    }));
  };

  const handleFinishStoryTime = () => {
    socket.emit('host:finishStoryTime', { roomCode, bonusPoints });
  };

  if (!isPromptGiver) {
    return (
      <div className="min-h-screen bg-pink-400 p-6 flex flex-col items-center justify-center font-sans text-center text-black">
        <div className="border-4 border-black bg-white p-8 w-full max-w-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black">
          <div className="text-5xl mb-4">🎤</div>
          <h2 className="text-3xl font-black uppercase text-black mb-2">Story Time!</h2>
          <p className="text-lg font-bold text-black border-2 border-black bg-yellow-300 p-3 my-4">
            Tell the room the story or trivia behind your song choice!
          </p>
          <p className="text-sm font-bold text-zinc-700">The Guesser will award story bonus points next!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-400 p-6 flex flex-col font-sans text-black">
      <div className="border-4 border-black bg-white p-6 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center text-black">
        <span className="bg-pink-400 text-black font-black text-xs border-2 border-black px-3 py-1 uppercase inline-block mb-2">
          Guesser Controls
        </span>
        <h2 className="text-3xl font-black uppercase text-black mb-1">Award Story Bonus</h2>
        <p className="text-sm font-bold text-zinc-800">
          Give bonus points to players with the best stories or trivia!
        </p>
      </div>

      <div className="flex-grow space-y-4 overflow-y-auto mb-6">
        {nonPromptPlayers.map((p) => (
          <div key={p.id} className="border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between text-black">
            <div>
              <h3 className="text-xl font-black uppercase text-black">{p.name}</h3>
              <p className="text-md font-bold text-zinc-700">Bonus: +{bonusPoints[p.id] || 0} pts</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePointChange(p.id, -25)}
                className="bg-red-400 text-black border-2 border-black font-black text-xl w-10 h-10 flex items-center justify-center hover:bg-red-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                -
              </button>
              <button
                onClick={() => handlePointChange(p.id, 25)}
                className="bg-green-400 text-black border-2 border-black font-black text-xl w-10 h-10 flex items-center justify-center hover:bg-green-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleFinishStoryTime}
        className="w-full bg-black text-white text-2xl font-black py-4 uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-800"
      >
        See Round Scores 🏆
      </button>
    </div>
  );
}